import { Banknote } from "lucide-react";
import Link from "next/link";
import { accountDataType, departmentDataType } from "@/src/types/types";

export default function SecondaryInformation({ accountData, departmentData }: { accountData: accountDataType | null; departmentData: departmentDataType | null }) {
  return (
    <>
      <div className="w-full col-span-2 sm:col-span-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6  ">
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label
              htmlFor={accountData ? "accountNumber" : "departmentName"}
              className="mb-2 block text-sm font-medium text-gray-900 "
            >
              {accountData ? "Account number" : "Department name"}
            </label>
            <input
              disabled
              type="text"
              id={accountData ? "accountNumber" : "departmentName"}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 "
              value={`${accountData ? accountData?.accountNumber : departmentData?.name}`}
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label
              htmlFor={accountData ? "balance" : "since"}
              className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-900 "
            >
              {accountData ? "Balance" : "Since"}
            </label>
            <input
              type="text"
              id={accountData ? "balance" : "since"}
              aria-describedby="helper-text-explanation"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 "
              value={`${accountData ? accountData?.balance : departmentData?.since}`}
              disabled
            />
          </div>

          <div>
            <label
              htmlFor={accountData ? "accountType" : "departmentRole"}
              className="mb-2 block text-sm font-medium text-gray-900 "
            >
              {accountData ? "Account Type" : "Role"}
            </label>
            <input
              disabled
              type="text"
              id={accountData ? "accountType" : "departmentRole"}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pe-10 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500  "
              value={`${accountData ? accountData?.accountType : departmentData?.role}`}
            />
          </div>

          <div>
            <label
              htmlFor={accountData ? "accountStatus" : "departmentStatus"}
              className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-900 "
            >
              {accountData ? "Account Status" : "Department Status"}
            </label>
            <input
              type="text"
              id={accountData ? "accountStatus" : "departmentStatus"}
              aria-describedby="helper-text-explanation"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 "
              value={`${accountData ? accountData?.accountStatus : departmentData?.status}`}
              disabled
            />
          </div>

          {accountData ? <Link
            href="/home/transactions"
            className="col-span-2 flex justify-center items-center px-4 py-2.5 text-base font-medium text-center text-white cursor-pointer bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-colors duration-200"
          >
            <Banknote className="mx-1.5" /> Transactions
          </Link> : <></>}
        </div>
      </div>
    </>
  );
}
