import { Controller } from "react-hook-form";

export default function PersonalInformation({ formState, register, control }: any) {
  return (
    <>
      <div className="  flex-col w-full items-center justify-center px-6 py-8 mx-auto lg:py-0">
        <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
          Personal Information
        </h2>
        <div className=" w-full  px-6 py-8 mx-auto">
          <div className="p-6  rounded-4xl shadow-2xl space-y-4 md:space-y-6 sm:p-8 w-full">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Name
              </label>
              <input
                type="text"
                {...register("name")}
                id="name"
                placeholder="Full Name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
              <span className="text-sm text-red-600">
                {formState.errors.name?.message}
              </span>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                id="email"
                placeholder="example@company.com"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
              <span className="text-sm text-red-600">
                {formState.errors.email?.message}
              </span>
            </div>

            {/* Date of Birth Field */}
            <div>
              <label
                htmlFor="date-of-birth"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Date of Birth
              </label>
              <input
                type="date"
                {...register("dateOfBirth")}
                id="date-of-birth"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
              <span className="text-sm text-red-600">
                {formState.errors.dateOfBirth?.message}
              </span>
            </div>

            {/* Phone Number Field */}
            <div>
              <label
                htmlFor="phone"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Phone Number
              </label>
              <input
                type="text"
                {...register("phone")}
                id="phone"
                placeholder="(+20)123456789"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
              <span className="text-sm text-red-600">
                {formState.errors.phone?.message}
              </span>
            </div>

            {/* Gender Field */}
            <Controller
              name="gender"
              control={control}
              rules={{ required: "Gender is required" }}
              render={({ field }) => (
                <div>
                  <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Gender
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      {...field}
                      value="male"
                      id="male"
                      checked={field.value === "male"}
                      className="mx-2"
                    />
                    <label htmlFor="male" className="text-gray-700">
                      Male
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      {...field}
                      value="female"
                      id="female"
                      checked={field.value === "female"}
                      className="mx-2"
                    />
                    <label htmlFor="female" className="text-gray-700">
                      Female
                    </label>
                  </div>
                </div>
              )}
            />
            <span className="text-sm text-red-600">
              {formState.errors.gender?.message}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
