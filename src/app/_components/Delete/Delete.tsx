"use client";
// Delete.tsx
// Fixed: replaced broken `import { createContext } from "vm"` with `useContext` from React.
// The original code imported createContext from Node.js 'vm' module (wrong!) and used
// it to access the SearchResult context — this would cause a runtime crash.

import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { SearchResult } from "../../_context/SearchResult/SearchResult";

export default function Delete({
  whoWeDelete,
  id,
}: {
  whoWeDelete: string;
  id?: string;
}) {
  const [makingSure, setMakingSure] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Fixed: use useContext hook, not createContext (which creates a new context object)
  const { setSearchResult } = useContext(SearchResult);

  async function handleDelete() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/deleteAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ whoWeDelete, id }),
      });
      const response = await res.json();
      if (response.ok) {
        toast.success(
          `${whoWeDelete === "user" ? "User" : "Employee"} deleted successfully!`
        );
        setSearchResult("");
        router.push("/home");
      } else {
        setIsLoading(false);
        // Handle specific backend error codes
        const code = response.error?.code;
        if (code === "CANNOT_DELETE_ADMIN") {
          toast.error("Cannot delete the last admin account.");
        } else {
          toast.error(
            `Failed to delete the ${whoWeDelete === "user" ? "user" : "employee"}. Please try again.`
          );
        }
      }
    } catch {
      setIsLoading(false);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <>
      <button
        onClick={() => setMakingSure(true)}
        className="col-span-2 flex justify-center items-center px-4 py-2.5 text-base font-medium text-center text-white cursor-pointer bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-colors duration-200"
      >
        <Trash className="mx-1.5" />
        Delete
      </button>
      <ToastContainer />
      {makingSure ? (
        <>
          <div className="col-span-2 p-4 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-800 text-center">
              Are you sure you want to delete this{" "}
              {whoWeDelete === "user" ? "user" : "employee"}?
            </p>
            <div className="flex justify-center mt-2">
              <button
                onClick={() => handleDelete()}
                disabled={isLoading}
                className={`${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                } px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-colors duration-200`}
              >
                {isLoading ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setMakingSure(false)}
                disabled={isLoading}
                className={`${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                } ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:ring-4 focus:ring-gray-300 transition-colors duration-200`}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
