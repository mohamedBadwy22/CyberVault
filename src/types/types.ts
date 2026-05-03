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
  name: string
  email: string
  dateOfBirth: string
  gender: string
  id: string
  phoneNumber: number
}

export type accountDataType = {
  accountNumber: string
  balance: number
  accountType: string
  accountStatus: string
  id : string
}

export type departmentDataType = {
  name: string
  role: string
  since: string
  status: string
  id: string
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

export type HistoryRecord = {
  transactionId: string;
  date: string;
  type: "Debit" | "Credit" | "Transfer";
  amount: string;
  destinationAccount: string | null;
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
