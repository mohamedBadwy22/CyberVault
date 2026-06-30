"use client";

import ChangePassword from "@/src/app/_components/ChangePassword/ChangePassword";
import { signOut } from "next-auth/react";

export default function ChangePasswordPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center items-center">
      <div className="w-11/12 md:w-8/12 lg:w-6/12 max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Security Requirement
          </h1>
          <p className="text-gray-600">
            You must change your password to continue using your account.
          </p>
        </div>
        <ChangePassword />
        <div className="w-full pt-4 sm:w-max sm:place-self-end sm:py-4 sm:ps-4">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full cursor-pointer mt-2 rounded-lg border border-gray-300 bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-200"
        >
          Sign Out
        </button>
        </div>
      </div>
    </div>
  );
}
