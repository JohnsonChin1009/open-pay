"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
    <main className="flex items-center justify-center h-screen">
      <p className="text-center text-lg">Finishing sign in...</p>
    </main>
  );
}
