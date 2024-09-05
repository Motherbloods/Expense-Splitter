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

// [
//   {
//     _id: "66d8406c35e593a0db78b664",
//     room: "66d80b9d2577f5a875e8002c",
//     name: "AKU",
//     paidBy: "habib",
//     total: 20000,
//     participants: ["habib", "irfan", "pria"],
//     splits: [
//       {
//         participant: "habib",
//         amount: 13333.333333333332,
//         _id: "66d8406c35e593a0db78b665",
//       },
//       {
//         participant: "irfan",
//         amount: -6666.666666666667,
//         _id: "66d8406c35e593a0db78b666",
//       },
//       {
//         participant: "pria",
//         amount: -6666.666666666667,
//         _id: "66d8406c35e593a0db78b667",
//       },
//     ],
//     createdAt: "2024-09-04T11:11:40.984Z",
//     __v: 0,
//   },
//   {
//     _id: "66d8148560ea85192d45c41d",
//     room: "66d80b9d2577f5a875e8002c",
//     name: "makan malam",
//     paidBy: "habib",
//     total: 13000,
//     participants: ["irfan"],
//     splits: [
//       { participant: "irfan", amount: -13000, _id: "66d8148560ea85192d45c41e" },
//     ],
//     createdAt: "2024-09-04T08:04:21.792Z",
//     __v: 0,
//   },
//   {
//     _id: "66d81333a9f336d0a94f33ba",
//     room: "66d80b9d2577f5a875e8002c",
//     name: "makan pagi",
//     paidBy: "pria",
//     total: 17000,
//     participants: ["habib"],
//     splits: [
//       { participant: "habib", amount: -17000, _id: "66d81333a9f336d0a94f33bb" },
//     ],
//     createdAt: "2024-09-04T07:58:43.690Z",
//     __v: 0,
//   },
//   {
//     _id: "66d80f9be6835e5043533520",
//     room: "66d80b9d2577f5a875e8002c",
//     name: "balekambang",
//     paidBy: "irfan",
//     total: 24000,
//     participants: ["habib", "irfan", "pria"],
//     splits: [
//       { participant: "habib", amount: -8000, _id: "66d80ff89467c91dae0d3bb2" },
//       { participant: "irfan", amount: 16000, _id: "66d80ff89467c91dae0d3bb3" },
//       { participant: "pria", amount: -8000, _id: "66d80ff89467c91dae0d3bb4" },
//     ],
//     createdAt: "2024-09-04T07:43:23.297Z",
//     __v: 1,
//   },
//   {
//     _id: "66d80c342577f5a875e80066",
//     room: "66d80b9d2577f5a875e8002c",
//     name: "studio bandung",
//     paidBy: "habib",
//     total: 20000,
//     participants: ["pria"],
//     splits: [
//       { participant: "pria", amount: -20000, _id: "66d810079467c91dae0d3bcf" },
//     ],
//     createdAt: "2024-09-04T07:28:52.654Z",
//     __v: 1,
//   },
//   {
//     _id: "66d80bf22577f5a875e80053",
//     room: "66d80b9d2577f5a875e8002c",
//     name: "tiket masuk",
//     paidBy: "pria",
//     total: 24000,
//     participants: ["habib", "irfan", "pria"],
//     splits: [
//       { participant: "habib", amount: -8000, _id: "66d8100d9467c91dae0d3bf2" },
//       { participant: "irfan", amount: -8000, _id: "66d8100d9467c91dae0d3bf3" },
//       { participant: "pria", amount: 16000, _id: "66d8100d9467c91dae0d3bf4" },
//     ],
//     createdAt: "2024-09-04T07:27:46.171Z",
//     __v: 1,
//   },
//   {
//     _id: "66d80bce2577f5a875e80045",
//     room: "66d80b9d2577f5a875e8002c",
//     name: "bensin",
//     paidBy: "irfan",
//     total: 10000,
//     participants: ["habib"],
//     splits: [
//       { participant: "habib", amount: -10000, _id: "66d80bce2577f5a875e80046" },
//     ],
//     createdAt: "2024-09-04T07:27:10.847Z",
//     __v: 0,
//   },
//   {
//     _id: "66d80bab2577f5a875e80036",
//     room: "66d80b9d2577f5a875e8002c",
//     name: "makan siang",
//     paidBy: "habib",
//     total: 15000,
//     participants: ["habib", "irfan", "pria"],
//     splits: [
//       { participant: "habib", amount: 10000, _id: "66d80bab2577f5a875e80037" },
//       { participant: "irfan", amount: -5000, _id: "66d80bab2577f5a875e80038" },
//       { participant: "pria", amount: -5000, _id: "66d80bab2577f5a875e80039" },
//     ],
//     createdAt: "2024-09-04T07:26:35.946Z",
//     __v: 0,
//   },
// ];
