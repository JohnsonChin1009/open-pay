"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoginAnimation from "@/components/LoginAnimation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finalizeLogin = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error("Failed to retrieve session:", error);
        router.push("/sign-up");
        return;
      }

      const user_id = data.session.user.id;

      localStorage.setItem("user_id", user_id);
      router.push("/dashboard"); // or wherever you want to go next
    };

    finalizeLogin();
  }, [router]);

  return <LoginAnimation />;
}
