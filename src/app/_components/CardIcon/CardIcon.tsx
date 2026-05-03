import { ArrowRightLeft, BookUser, FileUser, User, UserRoundCog, UserRoundPlus } from "lucide-react";


export default function CardIcon({ fromWho, index }: { fromWho: number; index: number }) {
  return (
    <>
    {fromWho === 0 
    ? index === 0
      ? <User size={144} strokeWidth={1} />
      : <ArrowRightLeft size={144} strokeWidth={1} />
    :<></>
    }
    
    {fromWho === 1 
    ? index === 0
      ? <User size={144} strokeWidth={1} />
      : <UserRoundPlus size={144} strokeWidth={1} />
    :<></>
    }
    
    {fromWho === 2 
    ? index === 0
      ? <User size={144} strokeWidth={1} />
      : index === 1
        ? <UserRoundPlus size={144} strokeWidth={1} />
        : index === 2
          ? <UserRoundCog size={144} strokeWidth={1} />
          : index === 3
            ? <FileUser size={144} strokeWidth={1} />
            : <BookUser size={144} strokeWidth={1} />
    :<></>
    }
    </>
  )
}
