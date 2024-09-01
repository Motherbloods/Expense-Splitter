document.getElementById("expenseForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const roomId = window.roomId;
  console.log(roomId);
  try {
    const response = await axios.post(
      `/create/${roomId}`,
      Object.fromEntries(formData)
    );
    if (response.data.success) {
      window.location.href = `/dashboard/${roomId}`;
    }
  } catch (error) {
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.textContent =
      error.response.data.error || "Terjadi kesalahan. Silakan coba lagi.";
    errorMessage.style.display = "block";
  }
});

function validateExpenseForm() {
  var total = document.getElementById("total").value;
  if (isNaN(total) || total <= 0) {
    alert("Total pengeluaran harus berupa angka positif!");
    return false;
  }
  return true;
}
