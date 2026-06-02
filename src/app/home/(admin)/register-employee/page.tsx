"use client";
import DepartmentInformation from "@/src/app/_components/DepartmentInformation/DepartmentInformation";
import PersonalInformation from "@/src/app/_components/PersonalInformation/PersonalInformation";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function page() {
  const registerEmployeeSchema = zod.object({
    name: zod
      .string()
      .min(3, "Name must be at least 3 characters")
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
    phone: zod
      .string()
      .regex(/^(\+2)?01[0125][0-9]{8}$/, "Invalid phone number"),
    gender: zod.enum(["male", "female"], "Gender is required"),
    departmentName: zod.enum(
      ["HR", "IT", "Finance", "Marketing & Customer Service"],
      "Department Name is required",
    ),
    departmentRegion: zod
      .string()
      .min(3, "Region must be at least 3 characters")
      .max(50, "Region must be less than 50 characters"),
    departmentRole: zod.enum(["employee", "admin"], "Role is required"),
  });

  type RegisterEmployeeFormValues = zod.infer<typeof registerEmployeeSchema>;

  const form = useForm<RegisterEmployeeFormValues>({
    defaultValues: {
      name: "",
      email: "",
      dateOfBirth: "",
      phone: "",
      departmentRegion: "",
    },
    resolver: zodResolver(registerEmployeeSchema),
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
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          department: {
            departmentName: data.departmentName,
            departmentRegion: data.departmentRegion,
            departmentRole: data.departmentRole,
          },
        },
        whoWeAdd: "employee",
      }),
    });
    const response = await res.json();
    if (response.ok) {
      setIsLoading(false);
      form.reset();
      toast.success("Employee Registered Successfully");
    } else {
      setIsLoading(false);
      toast.error(response.message || "Failed to Register Employee");
    }
  }

  return (
    <>
      {/* Form Container */}
      <ToastContainer />
      <div className="container pt-7 min-h-screen">
        <form
          id="registerEmployee"
          className=" flex-col"
          onSubmit={handleSubmit((FormData) => onSubmit(FormData))}
        >
          <div className=" flex-col lg:grid lg:grid-cols-2 gap-5 ">
            <PersonalInformation
              formState={formState}
              register={register}
              control={control}
            />

            <DepartmentInformation
              formState={formState}
              register={register}
              control={control}
            />
          </div>

          <div className="w-full sm:w-max place-self-end p-4">
            <button
              disabled={isLoading}
              type="submit"
              form="registerEmployee"
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
