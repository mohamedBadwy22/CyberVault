"use client";

import { accountDataType, DebitTransactionFormValues } from "@/src/types/types";
import { SubmitHandler, useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function DebitTransaction({
  accountInfo,
}: {
  accountInfo: accountDataType;
}) {
  const debitTransactionSchema = zod.object({
    accountNumber: zod.string().nonempty("Account number is required"),
    amount: zod
      .number()
      .min(5, "The minimum debit amount is 5")
      .positive("Amount must be greater than zero")
      .refine((value) => accountInfo?.balance >= value, "Insufficient balance"),
    description: zod.string().optional(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DebitTransactionFormValues>({
    resolver: zodResolver(debitTransactionSchema),
    defaultValues: {
      accountNumber: accountInfo?.accountNumber ?? "",
      amount: 0,
      description: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<DebitTransactionFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const req = await fetch("/api/transactionMethodsAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ method: "debit", data, accountInfo }),
      });
      const payload = await req.json();
      if (payload.ok) {
        toast.success("Transaction successful");
        reset();
        window.location.href = "/home";
        return;
      }

      toast.error(payload.message ?? "Transaction failed");
      reset();
    } catch {
      toast.error("Transaction failed");
      reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-6 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
          Debit Transaction
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="accountNumber"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Account Number
            </label>
            <select
              id="accountNumber"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600"
              {...register("accountNumber")}
              required
            >
              <option value={accountInfo?.accountNumber}>
                {accountInfo?.accountNumber}
              </option>
            </select>
            <span className="text-sm text-red-500">
              {errors.accountNumber?.message}
            </span>
          </div>

          <div>
            <label
              htmlFor="debitAmount"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Amount
            </label>
            <input
              id="debitAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600"
              {...register("amount", { valueAsNumber: true })}
              required
            />
            <span className="text-sm text-red-500">
              {errors.amount?.message}
            </span>
          </div>

          <div>
            <label
              htmlFor="debitDescription"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Description
            </label>
            <textarea
              id="debitDescription"
              rows={4}
              placeholder="Enter transaction description"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600"
              {...register("description")}
            ></textarea>
          </div>

          <button
            type="submit"
            className={`w-full rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-medium text-black hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed`}
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Debit"}
          </button>
        </form>
      </div>
    </>
  );
}
