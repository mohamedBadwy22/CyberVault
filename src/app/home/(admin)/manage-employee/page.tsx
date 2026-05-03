"use client";
import Management from "@/src/app/_components/Management/Management";
import SearchForm from "@/src/app/_components/Search/Search";
import { SearchResult } from "@/src/app/_context/SearchResult/SearchResult";
import { useContext, useEffect, useState } from "react";

export default function page() {
  const [isLoading, setIsLoading] = useState(false);
  const [foundSearch, setFoundSearch] = useState(false);
  let { searchResult } = useContext(SearchResult);
  const whoWeSearch = 'employee';

  useEffect(() => {
    if (searchResult !== "") {
      setFoundSearch(true);
    } else {
      setFoundSearch(false);
    }
  }, [searchResult]);

  return (
    <>
      <div className="h-screen">
        <SearchForm isLoading={isLoading} setIsLoading={setIsLoading} />

      {foundSearch ? (
        <Management isLoading={isLoading} setIsLoading={setIsLoading} searchParam={searchResult} whoWeSearch={whoWeSearch} />
      ) : (
        <div className="text-center text-xl md:text-2xl rounded-full w-1/2 mx-auto my-2.5 py-2.5">
          No Result Shown Yet.
        </div>
      )}
      </div>
    </>
  );
}
