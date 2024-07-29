const expenses = [
  {
    description: "Sewa individu",
    total: 93,
    to: "pria",
    participants: ["habib", "irfan", "brama"],
    breakdown: { habib: 55, irfan: 30, brama: 8 },
  },
  {
    description: "Simaksi",
    total: 120,
    to: "pria",
    participants: ["habib", "brama", "irfan", "faqih", "wawan", "pria"],
    breakdown: {
      habib: 20,
      irfan: 20,
      brama: 20,
      faqih: 20,
      wawan: 20,
      pria: 20,
    },
  },
  {
    description: "Sarapan",
    total: 30,
    to: "pria",
    participants: ["habib", "brama", "irfan", "faqih", "wawan", "pria"],
    breakdown: { habib: 5, irfan: 5, brama: 5, faqih: 5, wawan: 5, pria: 5 },
  },
  {
    description: "Sewa kelompok",
    total: 60,
    to: "pria",
    participants: ["habib", "irfan", "brama", "faqih", "wawan", "pria"],
    breakdown: {
      habib: 10,
      irfan: 10,
      brama: 10,
      faqih: 10,
      wawan: 10,
      pria: 60,
    },
  },
  {
    description: "Snack",
    total: 12,
    to: "faqih",
    participants: ["habib", "irfan", "brama", "faqih", "wawan", "pria"],
    breakdown: {
      habib: 2,
      irfan: 2,
      brama: 2,
      faqih: 2,
      wawan: 2,
      pria: 2,
    },
  },
  {
    description: "Makan siang",
    total: 56,
    to: "habib",
    participants: ["habib", "irfan", "brama", "faqih", "wawan", "pria"],
    breakdown: {
      habib: 8,
      irfan: 8,
      brama: 8,
      faqih: 8,
      wawan: 8,
      pria: 8,
    },
  },
  {
    description: "Makan siang 2",
    total: 16,
    to: "irfan",
    participants: ["habib", "irfan"],
    breakdown: {
      habib: 8,
      irfan: 8,
    },
  },
];

function calculateTotalSplits(expenses) {
  const totalSplits = {};

  expenses.forEach((expense) => {
    expense.participants.forEach((participant) => {
      if (!totalSplits[participant]) {
        totalSplits[participant] = 0;
      }
      if (expense.breakdown[participant] !== undefined) {
        totalSplits[participant] += expense.breakdown[participant];
      }
    });
  });

  return totalSplits;
}

function calculateSettlements(totalSplits, expenses) {
  const settlementsMap = {};

  expenses.forEach((expense) => {
    const payer = expense.to; // gunakan "to" sebagai pengganti "paidBy"
    expense.participants.forEach((participant) => {
      if (participant !== payer) {
        const amount = expense.breakdown[participant];
        if (amount !== undefined) {
          const key = `${participant}->${payer}`;
          if (!settlementsMap[key]) {
            settlementsMap[key] = 0;
          }
          settlementsMap[key] += amount;
        }
      }
    });
  });

  const settlements = Object.keys(settlementsMap).map((key) => {
    const [from, to] = key.split("->");
    return {
      from,
      to,
      amount: Number(settlementsMap[key].toFixed(2)),
    };
  });

  return settlements;
}

const totalSplits = calculateTotalSplits(expenses);
const settlements = calculateSettlements(totalSplits, expenses);

console.log("Total Splits:", totalSplits);
console.log("Settlements:", settlements);

// const expenses = [
//   {
//     description: "Sewa individu",
//     total: 93,
//     to: "pria",
//     participants: ["habib", "irfan", "brama", "pria"],
//     breakdown: { habib: 55, irfan: 30, brama: 8 },
//   },
//   {
//     description: "Simaksi",
//     total: 100,
//     to: "pria",
//     participants: ["habib", "brama", "irfan", "faqih", "wawan", "pria"],
//     breakdown: { habib: 20, irfan: 20, brama: 20, faqih: 20, wawan: 20 },
//   },
//   {
//     description: "Sarapan",
//     total: 25,
//     to: "pria",
//     participants: ["habib", "brama", "irfan", "faqih", "wawan", "pria"],
//     breakdown: { habib: 5, irfan: 5, brama: 5, faqih: 5, wawan: 5 },
//   },
//   {
//     description: "Sewa kelompok",
//     total: 60,
//     to: "pria",
//     participants: ["habib", "irfan", "brama", "faqih", "wawan", "pria"],
//     breakdown: { habib: 10, irfan: 10, brama: 10, faqih: 10, wawan: 10 },
//   },
//   {
//     description: "Snack",
//     total: 8,
//     to: "faqih",
//     participants: ["habib", "irfan", "brama", "faqih", "wawan", "pria"],
//     breakdown: {
//       habib: 1.6,
//       irfan: 1.6,
//       brama: 1.6,
//       faqih: 1.6,
//       wawan: 1.6,
//       pria: 1.6,
//     },
//   },
//   {
//     description: "Makan siang",
//     total: 56,
//     to: "habib",
//     participants: ["habib", "irfan", "brama", "faqih", "wawan", "pria"],
//     breakdown: {
//       habib: 11.2,
//       irfan: 11.2,
//       brama: 11.2,
//       faqih: 11.2,
//       wawan: 11.2,
//     },
//   },
// ];

// function calculateTotalSplits(expenses) {
//   const totalSplits = {};

//   expenses.forEach((expense) => {
//     expense.participants.forEach((participant) => {
//       if (!totalSplits[participant]) {
//         totalSplits[participant] = 0;
//       }
//       if (expense.breakdown[participant] !== undefined) {
//         totalSplits[participant] += expense.breakdown[participant];
//       }
//     });
//   });

//   return totalSplits;
// }

// function calculateSettlements(totalSplits, expenses) {
//   const settlementsMap = {};

//   expenses.forEach((expense) => {
//     const payer = expense.to; // gunakan "to" sebagai pengganti "paidBy"
//     expense.participants.forEach((participant) => {
//       if (participant !== payer) {
//         const amount = expense.breakdown[participant];
//         if (amount !== undefined) {
//           const key = `${participant}->${payer}`;
//           if (!settlementsMap[key]) {
//             settlementsMap[key] = 0;
//           }
//           settlementsMap[key] += amount;
//         }
//       }
//     });
//   });

//   const settlements = [];
//   const processedPairs = new Set();

//   Object.keys(settlementsMap).forEach((key) => {
//     const [from, to] = key.split("->");
//     const reverseKey = `${to}->${from}`;
//     if (!processedPairs.has(key) && !processedPairs.has(reverseKey)) {
//       const amount = settlementsMap[key];
//       const reverseAmount = settlementsMap[reverseKey] || 0;
//       const netAmount = amount - reverseAmount;

//       if (netAmount > 0) {
//         settlements.push({
//           from,
//           to,
//           amount: Number(netAmount.toFixed(2)),
//         });
//       } else if (netAmount < 0) {
//         settlements.push({
//           from: to,
//           to: from,
//           amount: Number(Math.abs(netAmount).toFixed(2)),
//         });
//       }

//       processedPairs.add(key);
//       processedPairs.add(reverseKey);
//     }
//   });

//   return settlements;
// }

// const totalSplits = calculateTotalSplits(expenses);
// const settlements = calculateSettlements(totalSplits, expenses);

// console.log("Total Splits:", totalSplits);
// console.log("Settlements:", settlements);
