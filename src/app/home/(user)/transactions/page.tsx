"use client";
import ErrorMessage from "@/src/app/_components/ErrorMessage/ErrorMessage";
import Loader from "@/src/app/_components/Loader/Loader";
import CreditTransaction from "@/src/app/_components/Transactions/CreditTransaction";
import DebitTransaction from "@/src/app/_components/Transactions/DebitTransaction";
import HistoryTransaction from "@/src/app/_components/Transactions/HistoryTransaction";
import TransferTransaction from "@/src/app/_components/Transactions/TransferTransaction";
import { SearchResult } from "@/src/app/_context/SearchResult/SearchResult";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function TransactionsPage() {
  // Check if admin or employee is trying to access the page without searching for a user
  const { searchResult } = useContext(SearchResult);
  const { data: session , status} = useSession();
  const router = useRouter();

  if (searchResult === "" && session?.user?.role !== "user" && status !== "loading") {
    router.push("/not-found");
  }

  const [activeTab, setActiveTab] = useState<
    "debit" | "credit" | "transfer" | "history"
  >("debit");
  const [isLoading, setIsLoading] = useState(true);
  const [accountInfo, setAccountInfo] = useState<any | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchAccountNumber() {
      const res = await fetch("/api/transactionAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchParam: searchResult }),
      });
      const payload = await res.json();
      if (payload.ok) {
        setAccountInfo(payload.data);
      } else {
        setIsError(true);
      }
      setIsLoading(false);
    }

    fetchAccountNumber();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="container mx-auto px-4 py-8 min-h-screen flex justify-center items-center">
          <Loader />
        </div>
      ) : isError ? (
        <div className="min-h-screen flex justify-center items-center">
          <ErrorMessage />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 min-h-screen flex justify-center items-center">
          <div className="w-11/12 md:w-10/12 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:flex-wrap mb-5">
              <button
                type="button"
                onClick={() => setActiveTab("debit")}
                className={`rounded-lg cursor-pointer px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                  activeTab === "debit"
                    ? "bg-blue-700 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Debit
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("credit")}
                className={`rounded-lg cursor-pointer px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                  activeTab === "credit"
                    ? "bg-blue-700 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Credit
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("transfer")}
                className={`rounded-lg cursor-pointer px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                  activeTab === "transfer"
                    ? "bg-blue-700 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Transfer
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`rounded-lg cursor-pointer px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                  activeTab === "history"
                    ? "bg-blue-700 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                History
              </button>

              <div className="grow w-full md:w-auto">
                <h3 className={`md:justify-self-end text-center  rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm bg-gray-100 text-gray-700 border border-gray-300 `}>
                Balance : {accountInfo?.balance} EGP
              </h3>
              </div>
            </div>

            {activeTab === "debit" ? <DebitTransaction accountInfo={accountInfo} /> : <></>}
            {activeTab === "credit" ? <CreditTransaction accountInfo={accountInfo} /> : <></>}
            {activeTab === "transfer" ? <TransferTransaction accountInfo={accountInfo} /> : <></>}
            {activeTab === "history" ? <HistoryTransaction /> : <></>}
          </div>
        </div>
      )}
    </>
  );
}
