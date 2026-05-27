import { ReactNode } from "react"

export interface CardInterface {
  link: string
  bgColor: string
  hoverBgColor: string
  icon: number
  title: string
}

export type SearchResultContextType = {
  searchResult: string;
  setSearchResult: (value: string) => void;
};

export type profileDataType = {
  /** Database integer ID — used for API calls (DELETE /users/:id). */
  id: string
  /** 8-digit bank-issued user ID — displayed as "Bank ID" in the UI. */
  bankUserId: string
  name: string
  email: string
  dateOfBirth: string
  gender: string
  /** Backend field name is `phone` (decrypted before returning). */
  phone: string
}

export type accountDataType = {
  accountNumber: string
  balance: number
  accountType: string
  accountStatus: string
  currency?: string
  id : string
}

/** Matches the backend's GET /profile and GET /users/:id department sub-object exactly. */
export type departmentDataType = {
  departmentName: string
  departmentRegion?: string
  departmentRole: 'admin' | 'employee'
  departmentSince: string
  departmentStatus: 'active' | 'inactive'
}

export type TransactionMethod = "debit" | "credit" | "transfer";

export type DebitTransactionFormValues = {
  accountNumber: string;
  amount: number;
  description?: string;
};

export type CreditTransactionFormValues = {
  accountNumber: string;
  amount: number;
  description?: string;
};

export type TransferTransactionFormValues = {
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  description?: string;
};

/** Matches the backend's GET /transactions/history data array item exactly. */
export type HistoryRecord = {
  id: number;
  type: 'credit' | 'debit' | 'transfer';
  amount: number;
  currency: 'EGP' | 'USD' | 'EUR';
  destinationAccount: string | null;
  description: string | null;
  balanceAfter: number;
  createdAt: string;
};

export type AdminRecord = {
  name: string;
  role: "admin" | "employee" | "user" ;
  id: string;
  email: string;
  accountNumber: string | null;
};


export type TableState = "data" | "empty" | "loading";

export type TableColumn = {
  key: string;
  label: string;
  headerClassName?: string;
  cellClassName?: string;
};

export type TableSectionProps = {
  title: string;
  description: string;
  columns: TableColumn[];
  rows: Record<string, string | number | null | ReactNode>[];
  state: TableState;
  emptyMessage: string;
  filterLabel?: string;
  filterOptions?: string[];
  page: number;
  setPage: (page: number) => void;
  isFinished: boolean;
  setIsFinished: (isFinished: boolean) => void;
  setFilterValue: (value: string) => void;
};
