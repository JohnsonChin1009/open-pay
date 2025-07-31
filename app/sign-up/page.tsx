"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";

export default function SignUpPage() {
  // TODO: setup the backend logic for authentication
  return (
    <main className="flex flex-col justify-center min-h-screen px-8 py-10 space-y-20">
      <div className="space-y-10">
        <div className="space-y-3">
          <h1 className="font-headline text-2xl">Let&apos;s get started</h1>
          <p className="font-main font-medium">The first step towards trust</p>
        </div>
        <div className="flex flex-col space-y-6">
          <Input placeholder="Email" type="email" />
          <div className="space-y-2">
            <Input placeholder="Password" type="password" />
            <Button variant="text" className="justify-end">
              Forgot Password?
            </Button>
          </div>
        </div>
        <div>
          <Button>Login</Button>
        </div>
      </div>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          or with
          <Separator className="flex-1" />
        </div>
        <div className="flex items-center justify-center">
          <Button variant="outline" className="rounded-md max-w-[50%]">
            <FcGoogle size={24} />
            Google
          </Button>
        </div>
      </div>
    </main>
  );
}
