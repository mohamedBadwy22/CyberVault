import { CardInterface } from "@/src/types/types";
import Link from "next/link";
import CardIcon from "../CardIcon/CardIcon";

export default function Card({ card, index }: { card: CardInterface; index: number }) {

    
  return (
    <>
      <Link href={card.link} >
        <div className={`${card.bgColor} m-4 rounded-lg p-6 shadow-2xl w-full min-w-xs mx-auto ${card.hoverBgColor} transition-colors duration-100`}>
          <p className="text-xl font-semibold mb-4 flex justify-center">
            <CardIcon fromWho={card.icon} index={index} />
          </p>
          <p className="text-gray-700 mb-4 text-center">{card.title}</p>
        </div>
      </Link>
    </>
  );
}
