"use client";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const loginSchema = zod.object({
    bankUserId: zod
      .string()
      .length(8, { message: "Bank ID must be exactly 8 digits" })
      .regex(/^\d{8}$/, { message: "Bank ID must be a numeric 8-digit number" }),
    password: zod
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(20, { message: "Password must be less than 20 characters long" })
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
  });
  const form = useForm({
    defaultValues: {
      bankUserId: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });
  const { register, handleSubmit, formState } = form;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function mySubmit(data: { bankUserId: string; password: string }) {

    setIsLoading(true);
    let res = await signIn('credentials',{
        bankUserId : data.bankUserId,
        password : data.password,
        redirect: false,
        callbackUrl: '/'
    });    
    
    if (res?.ok) {
      setIsLoading(false);
      form.reset();
      window.location.href = "/home";
    } else {
      toast.error("Invalid credentials. Please check your Bank ID and password.");
      setIsLoading(false);
    }

  }

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => mySubmit(data))}
        id="loginForm"
        className="space-y-4 md:space-y-6"
        action="#"
      >
        {/* USER ID */}
        <div>
          <label
            htmlFor="bankUserId"
            className="block mb-2 text-sm font-medium text-gray-900 after:content-['*'] after:ml-0.5 after:text-red-500"
          >
            Bank ID
          </label>
          <input
            type="text"
            {...register("bankUserId")}
            id="bankUserId"
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
            placeholder="8-digit Bank ID"
            required
            maxLength={8}
          />
          {/* MODIFIED: block — span inherits parent width, never pushes card wider;
            min-h-[1.25rem] — reserves 20px even when empty, prevents form height jump */}
          <span className="block w-3xs md:w-xs lg:w-sm  text-sm text-red-500">
            {formState.errors.bankUserId?.message}
          </span>
        </div>

        {/* PASSWORD */}
        <div className="relative mb-0">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900 after:content-['*'] after:ml-0.5 after:text-red-500"
          >
            Password
            {/* show password toggle */}
            <div className="absolute right-3.5 top-8/12 -translate-y-1/2 ms-2 p-1 rounded cursor-pointer">
              {showPassword ? (
                <EyeOff onClick={() => setShowPassword(false)} />
              ) : (
                <Eye onClick={() => setShowPassword(true)} />
              )}
            </div>
          </label>
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            id="password"
            placeholder={showPassword ? "Aa@12345" : "••••••••"}
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
          />
        </div>
        <span className="block w-3xs md:w-xs lg:w-sm  text-sm text-red-500">
          {formState.errors.password?.message}
        </span>

        <button
          disabled={isLoading}
          type="submit"
          form="loginForm"
          className="w-full text-black bg-blue-800 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center  disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
        >
          {isLoading ? "Loading..." : "Sign in"}
        </button>
      </form>
      <ToastContainer />
    </>
  );
}
