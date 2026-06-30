"use client";

import { Unlock as UnlockIcon } from "lucide-react";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function Unlock({
  id,
}: {
  id?: string | number;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleUnlock() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/unlockUserAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const response = await res.json();
      if (response.ok) {
        toast.success("User unlocked successfully!");
      } else {
        toast.error(response.error?.message || "Failed to unlock user. Please try again.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => handleUnlock()}
        disabled={isLoading}
        className={`w-full flex justify-center items-center px-4 py-2.5 text-base font-medium text-center text-black cursor-pointer bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 transition-colors duration-200 ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      >
        <UnlockIcon className="mx-1.5" />
        {isLoading ? "Unlocking..." : "Unlock"}
      </button>
      <ToastContainer />
    </>
  );
}
