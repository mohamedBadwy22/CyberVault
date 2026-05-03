import { Controller } from "react-hook-form";

export default function DepartmentInformation({
  formState,
  register,
  control,
}: any) {
  return (
    <>
      <div className="  flex-col w-full items-center justify-center px-6 py-8 mx-auto lg:py-0">
        <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
          Department Information
        </h2>
        <div className=" w-full  px-6 py-8 mx-auto">
          <div className="p-6  rounded-4xl shadow-2xl space-y-4 md:space-y-6 sm:p-8 w-full">
            {/* Department Name Field */}
            <div>
              <label
                htmlFor="departmentName"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Department Name
              </label>
              <select
                {...register("departmentName")}
                id="departmentName"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Marketing & Customer Service">
                  Marketing & Customer Service
                </option>
              </select>
              <span className="text-sm text-red-600">
                {formState.errors.departmentName?.message}
              </span>
            </div>

            {/* Region Field */}
            <div>
              <label
                htmlFor="region"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Region
              </label>
              <input
                type="text"
                {...register("region")}
                id="region"
                placeholder="Employee Region"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
              <span className="text-sm text-red-600">
                {formState.errors.region?.message}
              </span>
            </div>

            {/* Role Field */}
            <Controller
              name="role"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <div>
                  <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Role
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      {...field}
                      value="employee"
                      id="employee"
                      checked={field.value === "employee"}
                      className="mx-2"
                    />
                    <label htmlFor="employee" className="text-gray-700">
                      Employee
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      {...field}
                      value="admin"
                      id="admin"
                      checked={field.value === "admin"}
                      className="mx-2"
                    />
                    <label htmlFor="admin" className="text-gray-700">
                      Admin
                    </label>
                  </div>
                </div>
              )}
            />
            <span className="text-sm text-red-600">
              {formState.errors.role?.message}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
