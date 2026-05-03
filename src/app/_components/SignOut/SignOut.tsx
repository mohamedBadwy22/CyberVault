"use client";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SignOut() {
  return (
    <>
      <div
        onClick={() =>
          signOut({
            callbackUrl: "/",
          })
        }
        className="bg-[#FEECEC] max-h-fit m-4 rounded-lg p-6 shadow-2xl min-w-xs cursor-pointer hover:bg-[#FCD5D5] transition-colors duration-100"
      >
        <p className="text-xl font-semibold mb-4 flex justify-center">
          <LogOut color="#B91C1C" size={144} strokeWidth={1} />
        </p>
        <p className="text-gray-700 mb-4 text-center">Sign Out</p>
      </div>
    </>
  );
}
