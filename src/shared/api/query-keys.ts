/**
 * Every TanStack Query key in the app. A prefix (e.g. `tickets`) invalidates all its variants.
 */
export const queryKeys = {
  tickets: ['tickets'],
  ticketList: (query: string) => ['tickets', query],
  ticket: ['ticket'],
  ticketDetail: (id: string) => ['ticket', id],
  messages: ['messages'],
  ticketMessages: (id: string) => ['messages', id],
  notifications: ['notifications'],
  dictionaries: ['dictionaries'],
  employees: ['employees'],
  adminEmployees: ['admin-employees'],
  adminTemplates: ['admin-templates'],
  adminSettings: ['admin-settings'],
  diagnostics: ['diagnostics'],
  audit: ['audit'],
} as const;
