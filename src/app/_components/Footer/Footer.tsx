import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="bg-blue-800 shadow-sm dark:bg-gray-900 p-4 text-black ">
        <div className="w-full max-w-7xl mx-auto p-4 md:py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            
              <span className="self-center text-2xl font-semibold whitespace-nowrap">
                CyberVault
              </span>
            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium sm:mb-0 ">
              <li>
                <a href='#' className="hover:underline me-4 md:me-6">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline me-4 md:me-6">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline me-4 md:me-6">
                  Licensing
                </a>
              </li>
              <li>
                <a href='#' className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
          <span className="block text-sm sm:text-center">
            © 2026{" "}
            <Link href={"/"} className="hover:underline">
              CyberVault-Bank™
            </Link>
            . All Rights Reserved.
          </span>
        </div>
      </footer>
    </>
  );
}
