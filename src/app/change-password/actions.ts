"use server";

import { backendFetch } from "@/src/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function updatePasswordAction(formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  try {
    const response = await backendFetch<{ message: string }>(
      "/profile/password",
      {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );
    
    revalidatePath("/home");
    return { success: true, message: response.data.message };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update password" };
  }
}
