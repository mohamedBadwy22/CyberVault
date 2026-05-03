
export default function Home() {
  return (
    <>
      <div className="h-screen relative">
        <section className="bg-[url('/Gemini_Generated_Image_7ydlu7ydlu7ydlu7.png')] bg-cover bg-center bg-no-repeat h-screen after:content-[''] after:absolute after:inset-0 after:bg-black/70 after:z-10"></section>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 max-w-7xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 ">
          <div className="mr-auto place-self-center lg:col-span-7">
            <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl text-white">
              Advanced Digital Banking Experience
            </h1>
            <p className="max-w-2xl mb-6 font-light text-white/70 lg:mb-8 md:text-lg lg:text-xl ">
              From secure transactions to account management, our platform helps customers and institutions manage their finances with confidence and ease.
            </p>
            <a
              href="#"
              className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
            >
              Get started
              <svg
                className="w-5 h-5 ml-2 -mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white/90 border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-black focus:ring-4 focus:ring-gray-100 "
            >
              Speak to Sales
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
