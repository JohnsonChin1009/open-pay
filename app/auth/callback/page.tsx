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
        router.push("/login");
        return;
      }
    
      router.push("/dashboard"); // or wherever you want to go next
    };

    finalizeLogin();
  }, [router]);

  return (
    <LoginAnimation />
  );
}
