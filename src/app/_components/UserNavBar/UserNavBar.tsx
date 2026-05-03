import { Landmark } from 'lucide-react'
import Link from 'next/link'
import { useContext } from 'react'
import { SearchResult } from '../../_context/SearchResult/SearchResult';

export default function UserNavBar() {
  const { setSearchResult } = useContext(SearchResult);

  return (
    <>
    <div className=" bg-blue-800 sticky top-0 z-50 py-6">
        <div className="container flex justify-center relative">
            <div className='bg-white text-black size-15 rounded-full border-4 border-black flex items-center justify-center px-4 py-2 absolute -bottom-12'>
                <Link onClick={()=> setSearchResult('')}  href={'/home'} className="flex items-center justify-center "><Landmark size={30} /></Link>
            </div>
        </div>
    </div>
    </>
  )
}
