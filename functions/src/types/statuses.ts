const statusA = ["Received", "Assigned", "In Progress"];
const statusB = ["Completed", "Archived", "On Hold", "Quoted"];
export const statuses = [...statusA, ...statusB];
export const allStatuses = ["Active", ...statuses];
export const monthNames = [
  {name: "January", value: 0},
  {name: "February", value: 1},
  {name: "March", value: 2},
  {name: "April", value: 3},
  {name: "May", value: 4},
  {name: "June", value: 5},
  {name: "July", value: 6},
  {name: "August", value: 7},
  {name: "September", value: 8},
  {name: "October", value: 9},
  {name: "November", value: 10},
  {name: "December", value: 11},
];
export const translatorStatuses = ["Assigned", "In Progress", "Completed"];
export const defaultStatuses = [
  "Received",
  "Assigned",
  "In Progress",
  "On Hold",
];
export const billingStatuses = ["In Progress", "Completed", "Archived"];
