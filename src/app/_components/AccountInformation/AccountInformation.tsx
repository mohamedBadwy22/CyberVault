import { Controller } from "react-hook-form";

export default function AccountInformation({ formState, register, control }: any) {
  return (
    <>
      <div className="  flex-col w-full items-center justify-center px-6 py-8 mx-auto lg:py-0">
        <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
          Account Information
        </h2>
        <div className=" w-full  px-6 py-8 mx-auto">
          <div className="p-6  rounded-4xl shadow-2xl space-y-4 md:space-y-6 sm:p-8 w-full">
            {/* Balance Field */}
            <div>
              <label
                htmlFor="balance"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Initial Balance
              </label>
              <input
                type="number"
                {...register("balance", { valueAsNumber: true })}
                id="balance"
                placeholder="0.00"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
              <span className="text-sm text-red-600">
                {formState.errors.balance?.message}
              </span>
            </div>

            {/* Currency Field */}
            <div>
              <label
                htmlFor="currency"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Currency
              </label>
              <select
                {...register("currency")}
                id="currency"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="EGP">Egyptian Pound (EGP)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
              <span className="text-sm text-red-600">
                {formState.errors.currency?.message}
              </span>
            </div>

            {/* Account Type Field */}
            <Controller
              name="accountType"
              control={control}
              rules={{ required: "Account Type is required" }}
              render={({ field }) => (
                <div>
                  <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Account Type
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      {...field}
                      value="saving"
                      id="saving"
                      checked={field.value === "saving"}
                      className="mx-2"
                    />
                    <label htmlFor="saving" className="text-gray-700">
                      Saving
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      {...field}
                      value="current"
                      id="current"
                      checked={field.value === "current"}
                      className="mx-2"
                    />
                    <label htmlFor="current" className="text-gray-700">
                      Current
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      {...field}
                      value="business"
                      id="business"
                      checked={field.value === "business"}
                      className="mx-2"
                    />
                    <label htmlFor="business" className="text-gray-700">
                      Business
                    </label>
                  </div>
                </div>
              )}
            />
            <span className="text-sm text-red-600">
              {formState.errors.accountType?.message}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
