"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  accountDataType,
  CreditTransactionFormValues,
} from "@/src/types/types";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import * as zod from "zod";

export default function CreditTransaction({
  accountInfo,
}: {
  accountInfo: accountDataType;
}) {
  const creditTransactionSchema = zod.object({
    accountNumber: zod.string().nonempty("Account number is required"),
    amount: zod
      .number()
      .min(5, "The minimum credit amount is 5")
      .positive("Amount must be greater than zero"),
    description: zod.string().optional(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreditTransactionFormValues>({
    resolver: zodResolver(creditTransactionSchema),
    defaultValues: {
      accountNumber: accountInfo?.accountNumber ?? "",
      amount: 0,
      description: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<CreditTransactionFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const req = await fetch("/api/transactionMethodsAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ method: "credit", data, accountInfo }),
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
          Credit Transaction
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="creditAccountNumber"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Account Number
            </label>
            <select
              id="creditAccountNumber"
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
              htmlFor="creditAmount"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Amount
            </label>
            <input
              id="creditAmount"
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
              htmlFor="creditDescription"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Description
            </label>
            <textarea
              id="creditDescription"
              rows={4}
              placeholder="Enter transaction description"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600"
              {...register("description")}
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-medium text-black hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Credit"}
          </button>
        </form>
      </div>
    </>
  );
}
