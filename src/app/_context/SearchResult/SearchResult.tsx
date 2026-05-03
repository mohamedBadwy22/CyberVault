'use client'
import { createContext, useState } from 'react'
import { SearchResultContextType } from '@/src/types/types';

export const SearchResult = createContext<SearchResultContextType>({
  searchResult: '',
  setSearchResult: () => {},
});

export default function SearchResultProvider({children,}: {children: React.ReactNode}) 
    {
        const [searchResult, setSearchResult] = useState('')
    return <SearchResult.Provider value={{ searchResult , setSearchResult }}>{children}</SearchResult.Provider>
}