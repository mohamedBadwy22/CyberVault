import Image from "next/image";

export default function about() {
  return (
    <>
      <section className="container mx-auto">
        <div className="py-8 px-4 mx-auto max-w-7xl sm:py-16 lg:px-6">
          <h2 className="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 ">
            About CyberVault
          </h2>
          <div className="grid pt-8 text-left border-t border-gray-200 md:gap-16  md:grid-cols-2">
            <div>
              <div className="mb-10">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 ">
                  Who are we?
                </h3>
                <p className="text-gray-500 ">
                  We are a team of students developing a modern digital banking
                  platform as our graduation project. Our goal is to provide a
                  secure, efficient, and user-friendly banking experience.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 ">
                  What is our mission?
                </h3>
                <p className="text-gray-500 ">
                  Our mission is to simplify financial services by offering
                  seamless account management, fast transactions, and reliable
                  banking tools for everyday use.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 ">
                  What services do we provide?
                </h3>
                <p className="text-gray-500 ">
                  Our platform allows users to manage accounts, transfer funds,
                  monitor transactions, and securely interact with banking
                  services through a modern web interface.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 ">
                  Why choose our platform?
                </h3>
                <p className="text-gray-500 ">
                  We focus on security, simplicity, and performance. Our system
                  is designed to ensure safe transactions while maintaining an
                  intuitive and responsive user experience.
                </p>
              </div>
            </div>

            <div>
              <div className="mb-10">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                  Our vision
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  We aim to contribute to the future of digital banking by
                  building scalable and innovative solutions that meet the needs
                  of both customers and financial institutions.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                  Security and reliability
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Security is at the core of our system. We implement best
                  practices to protect user data and ensure safe and reliable
                  financial operations.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                  Technology we use
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Our application is built using modern web technologies to
                  ensure high performance, scalability, and a smooth user
                  experience across devices.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
