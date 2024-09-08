document.addEventListener("DOMContentLoaded", () => {
  const filterPaidBy = document.getElementById("filter-paidby");
  const recipientFilter = document.getElementById("recipient-filter");

  if (filterPaidBy) {
    filterPaidBy.addEventListener("change", filterExpenses);
  }

  if (recipientFilter) {
    recipientFilter.addEventListener("change", filterSettlements);
  }

  // Initialize collapsibles and adjust table heights on page load
  initializeCollapsibles();
  adjustTableHeights();
});

function filterExpenses() {
  const filterValue = document.getElementById("filter-paidby").value;
  const tableBody = document.getElementById("expense-table-body");
  const rows = tableBody.getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i++) {
    const paidBy = rows[i].getAttribute("data-paidby");
    if (filterValue === "all" || filterValue === paidBy) {
      rows[i].style.display = "";
    } else {
      rows[i].style.display = "none";
    }
  }
  adjustTableHeights();
}

function confirmDelete(event) {
  if (!confirm("Apakah Anda yakin ingin menghapus pengeluaran ini?")) {
    event.preventDefault();
    return false;
  }
  return true;
}

function filterSettlements() {
  const filterValue = document
    .getElementById("recipient-filter")
    .value.toLowerCase();
  const normalSettlements = document.getElementById("normal-settlements");
  const simpleSettlements = document.getElementById("simple-settlements");

  filterSettlementRows(normalSettlements, filterValue);
  filterSettlementRows(simpleSettlements, filterValue);
  adjustTableHeights();
}

function filterSettlementRows(settlementTable, filterValue) {
  const rows = settlementTable.getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i++) {
    const recipient = rows[i].getAttribute("data-recipient").toLowerCase();
    if (filterValue === "" || recipient.includes(filterValue)) {
      rows[i].style.display = "";
    } else {
      rows[i].style.display = "none";
    }
  }
}

function toggleCollapsible(containerId, iconId) {
  const container = document.getElementById(containerId);
  const icon = document.getElementById(iconId);
  const settlement = document.querySelector(".settlement");

  if (container.classList.contains("show")) {
    container.style.height = container.scrollHeight + "px";
    setTimeout(() => {
      container.classList.remove("show");
      container.classList.add("hide");
      container.style.height = "0";
    }, 0);
    icon.style.transform = "rotate(-90deg)";
    settlement.style.gap = "0";
  } else {
    container.classList.remove("hide");
    container.classList.add("show");
    container.style.height = "auto";
    const height = container.scrollHeight;
    container.style.height = "0";
    setTimeout(() => {
      container.style.height = height + "px";
    }, 0);
    icon.style.transform = "rotate(0deg)";
    settlement.style.gap = "20px";
  }

  setTimeout(adjustTableHeights, 500); // Adjust heights after animation
}

function initializeCollapsibles() {
  const containers = document.querySelectorAll(".collapsible-container");
  containers.forEach((container) => {
    if (container.classList.contains("show")) {
      container.style.height = "auto";
    }
  });
}

function adjustTableHeights() {
  const containers = document.querySelectorAll(".collapsible-container");
  containers.forEach((container) => {
    if (container.classList.contains("show")) {
      const content =
        container.querySelector("table") || container.querySelector("p");
      if (content) {
        container.style.height = "auto";
      } else {
        container.style.height = "auto";
      }
    } else {
      container.style.height = "0px";
    }
  });
}

// Run after the page has loaded and whenever the window is resized
window.addEventListener("load", adjustTableHeights);
window.addEventListener("resize", adjustTableHeights);
document.addEventListener("DOMContentLoaded", adjustTableHeights);
