"use client";
import AccountInformation from "@/src/app/_components/AccountInformation/AccountInformation";
import PersonalInformation from "@/src/app/_components/PersonalInformation/PersonalInformation";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function page() {
  const registerUserSchema = zod.object({
    name: zod
      .string()
      .min(12, "Name is required")
      .max(100, "Full Name must be less than 100 characters"),
    email: zod.email("Invalid email address"),
    dateOfBirth: zod
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Your Birthday is Required")
      .refine((date) => {
        const userDate: any = new Date(date);
        const today: any = new Date();
        today.setHours(0, 0, 0, 0);
        return userDate - today < -568080000000;
      }, "You Must Be Older Than 18"),
    phoneNumber: zod
      .string()
      .regex(/^(\+2)?01[0125][0-9]{8}$/, "Invalid phone number"),
    gender: zod.enum(["male", "female"], "Gender is required"),
    balance: zod.number().min(1000, "Minimum Balance 1000"),
    currency: zod.enum(["EGP", "USD", "EUR"], "Currency is required"),
    accountType: zod.enum(
      ["saving", "current", "business"],
      "Account Type is required",
    ),
  });
  type RegisterUserFormValues = zod.infer<typeof registerUserSchema>;

  const form = useForm<RegisterUserFormValues>({
    defaultValues: {
      name: "",
      email: "",
      dateOfBirth: "",
      phoneNumber: "",
      balance: 0,
    },
    resolver: zodResolver(registerUserSchema),
  });
  const { register, handleSubmit, control, formState } = form;
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: any) {
    setIsLoading(true);
    const res = await fetch("/api/registerAPI", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phoneNumber,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          account: {
            accountType: data.accountType,
            currency: data.currency,
            balance: data.balance,
          },
        },
        whoWeAdd: "user",
      }),
    });
    const response = await res.json();
    if (response) {
      setIsLoading(false);
      form.reset();
      toast.success("User Registered Successfully");
    } else {
      setIsLoading(false);
      toast.error("Failed to Register User");
    }
  }

  return (
    <>
      {/* Form Container */}
      <ToastContainer />
      <div className="container pt-7 min-h-screen">
        <form
          id="registerUser"
          className=" flex-col"
          onSubmit={handleSubmit((FormData) => onSubmit(FormData))}
        >
          <div className=" flex-col lg:grid lg:grid-cols-2 gap-5 ">
            <PersonalInformation
              formState={formState}
              register={register}
              control={control}
            />

            <AccountInformation
              formState={formState}
              register={register}
              control={control}
            />
          </div>

          <div className="w-full sm:w-max place-self-end p-4">
            <button
              disabled={isLoading}
              type="submit"
              form="registerUser"
              className={`w-full ${isLoading ? "bg-gray-500 cursor-wait" : "bg-blue-800 hover:bg-blue-700"} cursor-pointer text-white  focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center `}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
