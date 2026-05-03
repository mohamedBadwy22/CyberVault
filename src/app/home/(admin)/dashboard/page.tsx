"use client";

import { useEffect, useState } from "react";
import { AdminRecord, TableColumn, TableState } from "@/src/types/types";
import TableSection from "@/src/app/_components/TableSection/TableSection";

const adminColumns: TableColumn[] = [
  { key: "name", label: "Name", cellClassName: "font-medium text-gray-900" },
  { key: "role", label: "Role" },
  { key: "id", label: "ID" },
  { key: "email", label: "Email", cellClassName: "whitespace-nowrap" },
  {
    key: "accountNumber",
    label: "Account Number",
    cellClassName: "whitespace-nowrap",
  },
];


export default function Page() {
  const [statePreview, setStatePreview] = useState<TableState>("loading");
  const [page, setPage] = useState(1);
  const [tableRows, setTableRows] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [filterValue, setFilterValue] = useState('All');

  useEffect(() => {
    setStatePreview("loading");
    async function fetchData () {
      const req = await fetch('/api/dashboardAPI',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page , filter: filterValue})
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
    <div className="container mx-auto min-h-screen px-4 py-8">
      <div className="space-y-5">
        <TableSection
          title="Account Directory"
          description="Users, admins, and employees are listed here with quick visual scanning support."
          columns={adminColumns}
          rows={tableRows!}
          state={statePreview}
          emptyMessage="No account records available for this view."
          filterLabel="Filter by role"
          filterOptions={["All", "admin", "employee", "user"]}
          page={page}
          setPage={setPage}
          isFinished={isFinished}
          setIsFinished={setIsFinished}
          setFilterValue={setFilterValue}
        />
      </div>
    </div>
  );
}
