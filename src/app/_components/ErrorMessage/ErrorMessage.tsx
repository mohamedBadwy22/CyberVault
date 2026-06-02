export default function ErrorMessage({ text = "Internal Server Error." }: { text?: string }) {
  return (
    <>
      <section className="container mx-auto px-4 py-8">
        <div className="py-8 px-4 mx-auto max-w-7xl lg:py-16 lg:px-6">
          <div className="mx-auto max-w-screen-sm text-center">
            <h2 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-blue-800">
              Error
            </h2>
            <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl ">
              {text}
            </p>
            <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
              Please Try Again Later.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
