import { authOption } from "@/src/auth";
import { getServerSession } from "next-auth";
import Card from "../_components/Card/Card";
import SignOut from "../_components/SignOut/SignOut";
import { CardInterface } from "@/src/types/types";
import { ToastContainer } from "react-toastify/unstyled";

export default async function HomePage() {
  const session = await getServerSession(authOption);
  const role = session?.user.role;
  const cardsByRole = {
    'user': [
      {
        link: "/home/profile",
        bgColor: "bg-[#F3E8FF]",
        hoverBgColor: "hover:bg-[#E9D5FF]",
        icon: 0,
        title: "My Profile",
      },
      {
        link: "/home/transactions",
        bgColor: "bg-[#E0F2FE]",
        hoverBgColor: "hover:bg-[#BAE6FD]",
        icon: 0,
        title: "Transactions",
      },
    ],
    'employee': [
      {
        link: "/home/manage-user",
        bgColor: "bg-[#E0F2FE]",
        hoverBgColor: "hover:bg-[#BAE6FD]",
        icon: 1,
        title: "Manage User",
      },
      {
        link: "/home/register-user",
        bgColor: "bg-[#EAF7F0]",
        hoverBgColor: "hover:bg-[#D7F0E3]",
        icon: 1,
        title: "Add User",
      },
    ],
    'admin': [
      {
        link: "/home/manage-user",
        bgColor: "bg-[#E0F2FE]",
        hoverBgColor: "hover:bg-[#BAE6FD]",
        icon: 2,
        title: "Manage User",
      },
      {
        link: "/home/register-user",
        bgColor: "bg-[#EAF7F0]",
        hoverBgColor: "hover:bg-[#D7F0E3]",
        icon: 2,
        title: "Add User",
      },
      {
        link: "/home/manage-employee",
        bgColor: "bg-[#F3E8FF]",
        hoverBgColor: "hover:bg-[#E9D5FF]",
        icon: 2,
        title: "Manage Employee",
      },
      {
        link: "/home/register-employee",
        bgColor: "bg-[#E0F2FE]",
        hoverBgColor: "hover:bg-[#BAE6FD]",
        icon: 2,
        title: "Add Employee",
      },
      {
        link: "/home/dashboard",
        bgColor: "bg-[#EAF7F0]",
        hoverBgColor: "hover:bg-[#D7F0E3]",
        icon: 2,
        title: "Dashboard",
      },
    ],
  };
  const selectedCards = cardsByRole[role as keyof typeof cardsByRole];

  return (
    <>
      <div className="container min-h-screen py-10 flex gap-4 flex-wrap justify-center items-center">
        {selectedCards.map((card : CardInterface , index)=>{
            return <Card key={card.link} card={card} index={index}/>
        })}
        <SignOut />
      </div>
      <ToastContainer/>
    </>
  );
}
