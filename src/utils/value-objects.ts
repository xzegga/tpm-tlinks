export const statuses = [
  'Received',
  'Assigned',
  'In Progress',
  'Completed',
  'Archived',
  'On Hold',
  'Quoted',
  'Delivered',
];
export const noTranslatorsStatuses = [
  'Received',
  'In Progress',
  'Completed',
  'Archived',
  'On Hold',
  'Quoted',
];
export const allStatuses = ['Active', ...statuses];
export const allStatusesWitNoTranslators = ['Active', ...noTranslatorsStatuses];
export const monthNames = [
  { name: 'January', value: 0 },
  { name: 'February', value: 1 },
  { name: 'March', value: 2 },
  { name: 'April', value: 3 },
  { name: 'May', value: 4 },
  { name: 'June', value: 5 },
  { name: 'July', value: 6 },
  { name: 'August', value: 7 },
  { name: 'September', value: 8 },
  { name: 'October', value: 9 },
  { name: 'November', value: 10 },
  { name: 'December', value: 11 },
];

export const STATUS = {
  Received: 'Received',
  Assigned: 'Assigned',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Archived: 'Archived',
  OnHold: 'On Hold',
  Quoted: 'Quoted',
  Delivered: 'Delivered',
} as const;

export const defaultStatuses = [
  STATUS.Received,
  STATUS.InProgress,
  STATUS.OnHold,
  STATUS.Delivered,
];
export const billingStatuses = [
  STATUS.InProgress,
  STATUS.Completed,
  STATUS.Archived,
];
export const translatorStatuses = [
  STATUS.Assigned,
  STATUS.InProgress,
  STATUS.Completed,
];
export const adminStatuses = [
  STATUS.Received,
  STATUS.Assigned,
  STATUS.InProgress,
  STATUS.Completed,
  STATUS.Archived,
  STATUS.OnHold,
  STATUS.Quoted,
  STATUS.Delivered,
];
