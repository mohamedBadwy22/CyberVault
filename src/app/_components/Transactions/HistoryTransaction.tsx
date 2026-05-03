"use client";

import { useEffect, useState } from "react";
import { HistoryRecord, TableColumn, TableState } from "@/src/types/types";
import TableSection from "../TableSection/TableSection";

const historyColumns: TableColumn[] = [
  {
    key: "transactionId",
    label: "Transaction ID",
    cellClassName: "font-medium text-gray-900",
  },
  { key: "date", label: "Date" },
  { key: "type", label: "Type" },
  { key: "amount", label: "Amount", cellClassName: "whitespace-nowrap" },
  {
    key: "destinationAccount",
    label: "Destination Account",
    cellClassName: "whitespace-nowrap",
  },
];


export default function HistoryTransaction() {
  const [statePreview, setStatePreview] = useState<TableState>("loading");
  const [page, setPage] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [filterValue, setFilterValue] = useState("All");
  const [tableRows, setTableRows] = useState<HistoryRecord[] | null>(null);

  useEffect(() => {
    setStatePreview("loading");
    async function fetchData () {
      const req = await fetch('/api/transactionsHistoryAPI',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page , filter: filterValue , method : 'history' })
      });
      const payload = await req.json();
      if(payload.ok) {
        setStatePreview("data");
        setTableRows(payload.data);
      }
      else {
        setIsFinished(payload.finished);
        setStatePreview("empty");
      }
    }
    
    fetchData();
  }, [page, filterValue])

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
