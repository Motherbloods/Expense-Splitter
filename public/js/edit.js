document
  .getElementById("editExpenseForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const expenseId = window.expenseId;

    if (!expenseId) {
      console.error("Expense ID is undefined");
      const errorMessage = document.getElementById("errorMessage");
      errorMessage.textContent =
        "Invalid expense ID. Please try reloading the page.";
      errorMessage.style.display = "block";
      return;
    }

    try {
      const response = await axios.post(
        `/edit/${expenseId}`,
        Object.fromEntries(formData)
      );
      if (response.data.success) {
        console.log(response.data);
        window.location.href = `/dashboard/${response.data.roomId}`;
      }
    } catch (error) {
      const errorMessage = document.getElementById("errorMessage");
      errorMessage.textContent =
        error.response?.data?.error || "An error occurred. Please try again.";
      errorMessage.style.display = "block";
    }
  });
