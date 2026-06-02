// Central list of backend endpoint paths. BACKEND_URL already includes /api/v1.
export const API_ENDPOINTS = {
  health: '/',
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  profile: {
    get: '/profile',
    update: '/profile',
    changePassword: '/profile/password',
  },
  users: {
    list: '/users',
    byId: (id: string | number) => `/users/${encodeURIComponent(String(id))}`,
    create: '/users',
    update: (id: string | number) => `/users/${encodeURIComponent(String(id))}`,
    remove: (id: string | number) => `/users/${encodeURIComponent(String(id))}`,
    unlock: (id: string | number) => `/users/${encodeURIComponent(String(id))}/unlock`,
  },
  employees: {
    create: '/employees',
  },
  accounts: {
    lookup: (accountNumber: string) =>
      `/accounts/lookup?accountNumber=${encodeURIComponent(accountNumber)}`,
  },
  transactions: {
    credit: '/transactions/credit',
    debit: '/transactions/debit',
    transfer: '/transactions/transfer',
    history: '/transactions/history',
    historyByUserId: (userId: string | number) =>
      `/transactions/history/${encodeURIComponent(String(userId))}`,
  },
  contact: '/contact',
  docs: '/docs',
} as const;
