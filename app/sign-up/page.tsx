"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const handleLoginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-8 md:px-16 py-10 bg-white">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl space-y-16">
        <div className="space-y-3 text-center">
          <h1 className="font-headline text-3xl sm:text-4xl">
            Let&apos; get started
          </h1>
          <p className="font-main font-medium">
            Taking the first step towards trust
          </p>
        </div>
        <div className="flex flex-col space-y-6">
          <Input placeholder="Email" type="email" />
          <div className="space-y-2">
            <Input placeholder="Password" type="password" />
            <Button variant="text" className="flex justify-end">
              Forgot Password?
            </Button>
          </div>
        </div>
        <div>
          <Button className="w-full">Login</Button>
        </div>
      </div>
      <div className="space-y-5 mt-10">
        <div className="flex items-center gap-3 text-sm">
          <Separator className="flex-1" />
          or with
          <Separator className="flex-1" />
        </div>
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="w-full max-w-xs gap-2"
            onClick={handleLoginWithGoogle}
          >
            <FcGoogle size={20} />
            Google
          </Button>
        </div>
      </div>
    </main>
  );
}
