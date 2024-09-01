document.addEventListener("DOMContentLoaded", () => {
  const filterPaidBy = document.getElementById("filter-paidby");
  const recipientFilter = document.getElementById("recipient-filter");

  if (filterPaidBy) {
    filterPaidBy.addEventListener("change", filterExpenses);
  }

  if (recipientFilter) {
    recipientFilter.addEventListener("change", filterSettlements);
  }
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
}
function confirmDelete(event) {
  if (!confirm("Apakah Anda yakin ingin menghapus pengeluaran ini?")) {
    event.preventDefault();
    return false; //
  }
  return true;
}

function filterSettlements() {
  const filterValue = document
    .getElementById("recipient-filter")
    .value.toLowerCase();
  const normalSettlements = document.querySelectorAll("#normal-settlements tr");
  const simpleSettlements = document.querySelectorAll("#simple-settlements tr");

  filterSettlementRows(normalSettlements, filterValue);
  filterSettlementRows(simpleSettlements, filterValue);
}

function filterSettlementRows(settlements, filterValue) {
  settlements.forEach((settlement) => {
    const recipient = settlement.getAttribute("data-recipient").toLowerCase();
    if (filterValue === "" || recipient.includes(filterValue)) {
      settlement.classList.remove("hidden");
    } else {
      settlement.classList.add("hidden");
    }
  });
}
