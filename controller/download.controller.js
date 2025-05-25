const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");

const Room = require("../models/Room");
const Expense = require("../models/Expense");
const {
  calculateDetailedSplits,
  calculateSimplifiedSplits,
} = require("./rooms.controller.js");

const processingRequests = new Set();

// Improved cleanup function for processing requests
const cleanupProcessingRequests = () => {
  const now = Date.now();
  console.log(`Current processing requests: ${processingRequests.size}`);
};

// Run cleanup every 5 minutes
setInterval(cleanupProcessingRequests, 5 * 60 * 1000);

const download_expense = async (req, res) => {
  const roomId = req.params.roomId;
  console.log("Download request for room:", roomId);
  const requestKey = `${roomId}-${req.user?.id || "anonymous"}`;

  // Check if request is already being processed
  if (processingRequests.has(requestKey)) {
    console.log(`Duplicate request blocked for room: ${roomId}`);
    return res.status(429).json({
      error: "PDF sedang dibuat, mohon tunggu...",
      message: "Request sudah dalam proses",
    });
  }

  // Add to processing set
  processingRequests.add(requestKey);

  let browser = null;
  let page = null;
  let timeoutId = null;

  // Improved cleanup function
  const cleanup = async () => {
    try {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (page && !page.isClosed()) {
        await page
          .close()
          .catch((err) => console.log("Page close error:", err));
      }

      if (browser && browser.connected) {
        await browser
          .close()
          .catch((err) => console.log("Browser close error:", err));
      }
    } catch (error) {
      console.log("Cleanup error:", error);
    } finally {
      processingRequests.delete(requestKey);
    }
  };

  try {
    console.log("Starting PDF generation for room:", roomId);

    // Set overall timeout for the entire operation
    const OPERATION_TIMEOUT = 90000; // 90 seconds
    timeoutId = setTimeout(async () => {
      console.log(`Operation timeout for room: ${roomId}`);
      await cleanup();
      if (!res.headersSent) {
        return res.status(408).json({
          error: "PDF generation timeout",
          message: "Proses terlalu lama",
        });
      }
    }, OPERATION_TIMEOUT);

    // Fetch room and expenses data
    const room = await Room.findById(roomId).lean();
    if (!room) {
      console.log("Room not found:", roomId);
      await cleanup();
      return res.status(404).json({ error: "Room tidak ditemukan" });
    }

    const expenses = await Expense.find({ room: roomId })
      .sort({ createdAt: -1 })
      .lean();

    console.log("Found expenses:", expenses.length);

    // Calculate splits for PDF
    const detailedSplits = calculateDetailedSplits(expenses);
    const { finalSplits, evenParticipants } =
      calculateSimplifiedSplits(detailedSplits);

    // Calculate total expenses
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.total,
      0
    );

    console.log("Rendering EJS template...");

    // Render HTML from EJS template
    const html = await ejs.renderFile(
      path.join(__dirname, "../views/expense_report.ejs"),
      {
        room,
        expenses,
        detailedSplits,
        finalSplits,
        evenParticipants,
        totalExpenses,
        generatedDate: new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }
    );

    console.log("HTML rendered, launching Puppeteer...");

    // Launch Puppeteer with improved configuration
    browser = await puppeteer.launch({
      headless: "new", // Changed from false to "new"
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--no-first-run",
        "--no-default-browser-check",
      ],
    });

    page = await browser.newPage();

    // Set page timeout
    page.setDefaultTimeout(45000);
    page.setDefaultNavigationTimeout(45000);

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 1,
    });

    console.log("Setting page content...");

    // Set content with proper wait conditions
    await page.setContent(html, {
      waitUntil: ["domcontentloaded", "networkidle2"],
      timeout: 45000,
    });

    // Additional wait to ensure all styles are applied
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if page is still available before PDF generation
    if (page.isClosed() || !browser.connected) {
      throw new Error("Browser or page closed before PDF generation");
    }

    console.log("Generating PDF...");

    // Generate PDF with improved settings
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
      timeout: 30000,
    });

    // bagian inti setelah PDF berhasil dibuat

    console.log("PDF generated successfully, size:", pdf.length);

    // Clear timeout since operation completed successfully
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Set response headers
    const sanitizedRoomName = room.name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_");
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Laporan_${sanitizedRoomName}_${timestamp}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdf.length);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    console.log("Sending PDF response with filename:", filename);

    // Send the PDF buffer and end the response FIRST
    res.end(pdf, async () => {
      // Baru setelah response selesai, lakukan cleanup
      console.log("PDF response sent, cleaning up...");
      await cleanup();
      console.log("Cleanup done");
    });

    console.log("res.end(pdf) called, waiting for callback to cleanup");

    // Jangan panggil cleanup disini lagi, karena sudah di callback
    // await cleanup();
  } catch (error) {
    console.error("Error generating PDF:", error);

    // Ensure cleanup
    await cleanup();

    // Send error response if headers haven't been sent
    if (!res.headersSent) {
      let errorMessage = "Gagal membuat PDF";
      let statusCode = 500;

      // Handle specific error types
      if (error.message.includes("timeout") || error.name === "TimeoutError") {
        errorMessage = "PDF generation timeout";
        statusCode = 408;
      } else if (
        error.message.includes("Target closed") ||
        error.name === "TargetCloseError"
      ) {
        errorMessage = "Browser connection lost";
        statusCode = 500;
      } else if (error.message.includes("Navigation timeout")) {
        errorMessage = "Page loading timeout";
        statusCode = 408;
      }

      return res.status(statusCode).json({
        error: errorMessage,
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
};

module.exports = download_expense;
