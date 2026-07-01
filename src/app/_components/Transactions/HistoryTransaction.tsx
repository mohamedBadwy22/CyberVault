"use client";

import { useEffect, useState } from "react";
import { HistoryRecord, TableColumn, TableState } from "@/src/types/types";
import TableSection from "../TableSection/TableSection";

const historyColumns: TableColumn[] = [
  {
    key: "id",
    label: "Transaction ID",
    cellClassName: "font-medium text-gray-900",
  },
  { key: "createdAt", label: "Date" },
  { key: "type", label: "Type" },
  { key: "amount", label: "Amount", cellClassName: "whitespace-nowrap" },
  {
    key: "destinationAccount",
    label: "Destination Account",
    cellClassName: "whitespace-nowrap",
  },
];

// Maps UI filter labels (Title Case) → backend `type` query param (lowercase per spec §8.4)
const FILTER_MAP: Record<string, string> = {
  All: "All",
  Debit: "debit",
  Credit: "credit",
  Transfer: "transfer",
};

export default function HistoryTransaction({
  searchParam = "",
}: {
  // bankUserId of the managed user (admin/employee flow); empty = own history
  searchParam?: string;
}) {
  const [statePreview, setStatePreview] = useState<TableState>("loading");
  const [page, setPage] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [filterValue, setFilterValue] = useState("All");
  const [tableRows, setTableRows] = useState<HistoryRecord[] | null>(null);

  useEffect(() => {
    setStatePreview("loading");
    async function fetchData() {
      const req = await fetch("/api/transactionsHistoryAPI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          filter: FILTER_MAP[filterValue] ?? "All",
          searchParam,
        }),
      });
      const payload = await req.json();
      if (payload.ok) {
        setStatePreview("data");
        setTableRows(payload.data);
        setIsFinished(payload.finished ?? false);
      } else {
        setIsFinished(payload.finished ?? false);
        setStatePreview("empty");
      }
    }

    fetchData();
  }, [page, filterValue, searchParam]);

  return (
    <div className="space-y-4">
      <TableSection
        title="History Transactions"
        description="Review all posted transactions in a unified table view."
        columns={historyColumns}
        rows={tableRows!}
        state={statePreview}
        emptyMessage="No transactions found for the selected view."
        filterLabel="Filter by transaction type"
        filterOptions={["All", "Debit", "Credit", "Transfer"]}
        page={page}
        setPage={setPage}
        isFinished={isFinished}
        setIsFinished={setIsFinished}
        setFilterValue={setFilterValue}
      />
    </div>
  );
}
