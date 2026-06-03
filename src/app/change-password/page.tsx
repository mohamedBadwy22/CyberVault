"use client";

import ChangePassword from "@/src/app/_components/ChangePassword/ChangePassword";

export default function ChangePasswordPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center items-center">
      <div className="w-11/12 md:w-8/12 lg:w-6/12 max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Requirement</h1>
          <p className="text-gray-600">
            You must change your password to continue using your account.
          </p>
        </div>
        <ChangePassword />
      </div>
    </div>
  );
}
