"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import * as zod from "zod";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updatePasswordAction } from "@/src/app/change-password/actions";

const changePasswordSchema = zod
  .object({
    currentPassword: zod
      .string()
      .min(8, { message: "Current password must be at least 8 characters" })
      .max(20, { message: "Current password must be less than 20 characters" })
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    newPassword: zod
      .string()
      .min(8, { message: "New password must be at least 8 characters" })
      .max(20, { message: "New password must be less than 20 characters" })
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmPassword: zod
      .string()
      .min(8, { message: "Confirm password must be at least 8 characters" })
      .max(20, { message: "Confirm password must be less than 20 characters" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password must match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ChangePasswordFormValues = zod.infer<typeof changePasswordSchema>;

export default function ChangePassword({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: session, update } = useSession();
  const router = useRouter();

  const form = useForm<ChangePasswordFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(changePasswordSchema),
  });

  const { register, handleSubmit, formState, reset } = form;

  async function onSubmit(data: ChangePasswordFormValues) {
    setIsLoading(true);
    
    // Call server action to hide API endpoint from inspect
    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("newPassword", data.newPassword);
    
    const response = await updatePasswordAction(formData);

    if (response.success) {
      toast.success(response.message || "Password updated successfully");
      reset();
      
      // The backend invalidates our tokens upon password change.
      // We must transparently re-login to get a fresh access & refresh token.
      const bankUserId = session?.user?.bankUserId;
      if (bankUserId) {
        await signIn("credentials", {
          bankUserId: bankUserId,
          password: data.newPassword,
          redirect: false,
        });
      }

      // Forced first-login flow (no onSuccess) lands on /home; the voluntary
      // inline flow passes onSuccess to return to the profile tab in place.
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/home");
      }
    } else {
      toast.error(response.error || "Failed to change password");
    }
    
    setIsLoading(false);
  }

  return (
    <>
      <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-6 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
          Change Password
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="changePasswordForm" action="#" method="POST">
          <div className="relative">
            <label
              htmlFor="currentPassword"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder={showCurrentPassword ? "Aa@12345" : "••••••••"}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pe-10 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600"
              {...register("currentPassword")}
              required
            />
            <button
              type="button"
              aria-label="Toggle current password visibility"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute top-9 right-3 text-gray-600 hover:text-gray-800"
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <span className="block text-sm text-red-500">
              {formState.errors.currentPassword?.message}
            </span>
          </div>

          <div className="relative">
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder={showNewPassword ? "Aa@12345" : "••••••••"}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pe-10 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600"
              {...register("newPassword")}
              required
            />
            <button
              type="button"
              aria-label="Toggle new password visibility"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute top-9 right-3 text-gray-600 hover:text-gray-800"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <span className="block text-sm text-red-500">
              {formState.errors.newPassword?.message}
            </span>
          </div>

          <div className="relative">
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={showConfirmPassword ? "Aa@12345" : "••••••••"}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pe-10 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600"
              {...register("confirmPassword")}
              required
            />
            <button
              type="button"
              aria-label="Toggle confirm password visibility"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute top-9 right-3 text-gray-600 hover:text-gray-800"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <span className="block text-sm text-red-500">
              {formState.errors.confirmPassword?.message}
            </span>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              form="changePasswordForm"
              disabled={isLoading}
              className="w-full cursor-pointer rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </>
  );
}
