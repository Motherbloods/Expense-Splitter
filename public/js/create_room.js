document
  .getElementById("createRoomForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await axios.post(
        "/create-room",
        Object.fromEntries(formData)
      );
      console.log(response.data);
      if (response.data.success) {
        console.log("ini seharusnya berhasil");
        window.location.href = `/list-rooms/${response.data.userId}`;
      }
    } catch (error) {
      const errorMessage = document.getElementById("errorMessage");
      errorMessage.textContent =
        error.response.data.error || "Terjadi kesalahan. Silakan coba lagi.";
      errorMessage.style.display = "block";
    }
  });

function validateForm() {
  var name = document.getElementById("name").value;
  var createdBy = document.getElementById("createdBy").value;
  var participants = document.getElementById("participants").value;

  if (
    name.trim() === "" ||
    createdBy.trim() === "" ||
    participants.trim() === ""
  ) {
    alert("Semua field harus diisi!");
    return false;
  }
  return true;
}
