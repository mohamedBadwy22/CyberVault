import { Pen } from "lucide-react";

export default function Edit() {
  return (
    <div className="w-full flex justify-center items-center px-4 py-2.5 text-base font-medium text-center text-white cursor-pointer bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 transition-colors duration-200">
        <Pen className="mx-1.5" />Edit
    </div>
  );
}
