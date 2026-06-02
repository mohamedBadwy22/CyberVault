import Edit from "../Edit/Edit";
import Delete from "../Delete/Delete";
import Unlock from "../Unlock/Unlock";

export default function PersonalData({ profileData, whoWeDelete }: any) {
  return (
    <>
      <div
        className={`w-full col-span-2 sm:col-span-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6`}
      >
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2 lg:col-span-1">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-900 "
            >
              Full name
            </label>
            <input
              disabled
              type="text"
              id="name"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 "
              value={`${profileData?.name}`}
            />
          </div>

          <div className="col-span-2 lg:col-span-1">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-900 "
            >
              Email
            </label>
            <input
              disabled
              type="email"
              id="email"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pe-10 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500  "
              value={`${profileData?.email}`}
            />
          </div>

          <div>
            <label
              htmlFor="createdAt"
              className="mb-2 block text-sm font-medium text-gray-900 "
            >
              Date of Birth
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3.5">
                <svg
                  className="h-4 w-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                datepicker-format="mm/yy"
                id="createdAt"
                type="text"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-9 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700  dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                value={`${profileData?.dateOfBirth}`}
                disabled
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="gender"
              className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-900 "
            >
              Gender
            </label>
            <input
              type="text"
              id="gender"
              aria-describedby="helper-text-explanation"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 "
              value={`${profileData?.gender}`}
              disabled
            />
          </div>

          <div>
            <label
              htmlFor="id"
              className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-900 "
            >
              ID
            </label>
            <input
              type="text"
              id="id"
              aria-describedby="helper-text-explanation"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 "
              value={`${profileData?.bankUserId}`}
              disabled
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-900 "
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phone"
              aria-describedby="helper-text-explanation"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 "
              value={`${profileData?.phone}`}
              disabled
            />
          </div>

          <div className="col-span-2 flex flex-col md:flex-row justify-between gap-4 w-full mt-4">
            {whoWeDelete ? (
              <>
                <Delete whoWeDelete={whoWeDelete} id={profileData?.id} />
                <Unlock id={profileData?.id} />
              </>
            ) : (
              <></>
            )}
            <Edit />
          </div>
        </div>
      </div>
    </>
  );
}
