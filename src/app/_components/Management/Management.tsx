import { useEffect, useState } from "react";
import { accountDataType, departmentDataType, profileDataType } from "@/src/types/types";
import SecondaryInformation from "../SecondaryInformation/SecondaryInformation";
import PersonalData from "../PersonalData/PersonalData";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";


export default function Management({
  isLoading,
  setIsLoading,
  searchParam,
  whoWeSearch,
}: {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  searchParam: string;
  whoWeSearch: string;
}) {
  const [isFound, setIsFound] = useState(false);
  const [accountData, setAccountData] = useState<accountDataType | null>(null);
  const [departmentData, setDepartmentData] = useState<departmentDataType | null>(null);
  const [profileData, setProfileData] = useState<profileDataType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("Internal Server Error.");

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/manageAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchParam, whoWeSearch }),
      });
      const response = await res.json();
      if (response.ok) {
        setIsLoading(false);
        whoWeSearch === 'user' ?
        setAccountData(response.data.secondaryData):
        setDepartmentData(response.data.secondaryData);
        setProfileData(response.data.profileData);
        setIsFound(true);
      } else {
        setIsLoading(false);
        setIsFound(false);
        setErrorMessage(response.error?.message || "Internal Server Error.");
      }
    }

    fetchData();
  }, [searchParam]);

  return (
    <>
      {isLoading ? (
        <Loader /> 
      ) : isFound ? (
        <div className="container mx-auto px-4 py-8 grid grid-cols-2 gap-4">
          {/* User Information */}
          <PersonalData profileData={profileData} whoWeDelete={whoWeSearch} />

          {/* System Information */}
          <SecondaryInformation accountData={accountData!} departmentData={departmentData!} /> 
        </div>
      ) : (
        <div className="text-center text-xl md:text-2xl rounded-full w-1/2 mx-auto my-10 py-10 bg-white shadow-sm border border-gray-200 text-gray-500">
          No results found.
        </div>
      )}
    </>
  );
}
