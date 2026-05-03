"use client";
import { useSession } from "next-auth/react";
import UserNavBar from "../UserNavBar/UserNavBar";
import GuestNavBar from "../GuestNavBar/GuestNavBar";


export default function NavBar() {
  const { status } = useSession();
  
  return (
    <>
      {status === "authenticated" ? <UserNavBar /> : <></>}
      {status === "unauthenticated" ? <GuestNavBar /> : <></>}
    </>
  );
}
