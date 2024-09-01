document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const roomList = document.getElementById("roomList");
  const rooms = Array.from(roomList.getElementsByClassName("room-item"));
  const noRoomMessage = document.createElement("p");
  noRoomMessage.textContent = "Room tidak ada";
  noRoomMessage.style.display = "none"; // Hide the message initially
  roomList.appendChild(noRoomMessage);

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    let hasVisibleRooms = false;

    rooms.forEach((room) => {
      const roomName = room.getAttribute("data-room-name");
      if (roomName.includes(searchTerm)) {
        room.style.display = ""; // Show the room
        hasVisibleRooms = true; // At least one room is visible
      } else {
        room.style.display = "none"; // Hide the room
      }
    });

    if (!hasVisibleRooms) {
      noRoomMessage.style.display = ""; // Show the "Room tidak ada" message
    } else {
      noRoomMessage.style.display = "none"; // Hide the "Room tidak ada" message
    }
  });
});
