"use client";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Landmark, TextAlignJustify } from "lucide-react";
import { usePathname } from "next/navigation";


export default function NavBar() {
  const pathname = usePathname();
  const [active, setActive] = useState(pathname || null);

  

  return (
    <>
      <div className=" bg-blue-800 sticky top-0 z-50 py-2.5">
        <div className="container flex justify-between ">
          {/* NavBar Left Content */}
          <div className="py-2.5 ms-3 flex items-center justify-between">
            <div className="m-1.5 md:hidden">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="cursor-pointer"><TextAlignJustify /></Button>
                </PopoverTrigger>

                <PopoverContent className="bg-blue-950">
                  <ul className="flex-col gap-3 justify-center items-center text-2xl">
                    <li
                      className={`mx-2 ${active === "/" ? "text-white underline" : "text-black"}`}
                      onClick={() => setActive("/")}
                    >
                      <Link href={"/"}>Home</Link>
                    </li>
                    <li
                      className={`mx-2 ${active === "/about" ? "text-white underline" : "text-black"}`}
                      onClick={() => setActive("/about")}
                    >
                      <Link href={"/about"}>About</Link>
                    </li>
                    <li
                      className={`mx-2 ${active === "/contact" ? "text-white underline" : "text-black"}`}
                      onClick={() => setActive("/contact")}
                    >
                      <Link href={"/contact"}>Contact Us</Link>
                    </li>
                  </ul>
                </PopoverContent>
              </Popover>
            </div>
            <div className="text-2xl font-bold text-black">
              <Link href={'/'} onClick={()=>setActive('/')} className="flex items-center justify-center"><Landmark className="ms-2 me-1.5"/><p>CyberVault.</p></Link>
            </div>
          </div>

          {/* NavBar Center Content */}
          <div className="hidden md:flex px-2">
            <ul className="flex gap-3 justify-center items-center text-2xl">
              <li
                className={`mx-2 ${active === "/" ? "text-white underline" : "text-black"}`}
                onClick={() => setActive("/")}
              >
                <Link href={"/"}>Home</Link>
              </li>
              <li
                className={`mx-2 ${active === "/about" ? "text-white underline" : "text-black"}`}
                onClick={() => setActive("/about")}
              >
                <Link href={"/about"}>About</Link>
              </li>
              <li
                className={`mx-2 ${active === "/contact" ? "text-white underline" : "text-black"}`}
                onClick={() => setActive("/contact")}
              >
                <Link href={"/contact"}>Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* NavBar Right Content */}
          <div className=" me-3 self-center">
            <Button size={"lg"} className="cursor-pointer px-0" variant="outline" onClick={()=> setActive(null)}>
              <Link href={"/login"} className="text-xl px-2.5">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
