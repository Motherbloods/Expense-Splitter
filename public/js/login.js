document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  try {
    const response = await axios.post("/login", Object.fromEntries(formData));
    if (response.data.success) {
      window.location.href = `/list-rooms/${response.data.userId}`;
    }
  } catch (error) {
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.textContent =
      error.response.data.error || "An error occurred. Please try again.";
    errorMessage.style.display = "block";
  }
});
function togglePassword(inputId) {
  const passwordInput = document.getElementById(inputId);
  const icon = document.querySelector(`#${inputId} + .password-toggle i`);

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}
