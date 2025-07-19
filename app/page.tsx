"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage("Login failed: " + error.message);
    } else {
      setMessage("Check your email for a magic login link!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 space-y-10">
      <div className="relative h-[80px] w-[200px]">
        <Image 
          src="/logo.png"
          alt="OpenPay Logo"
          fill
          objectFit="contain"
          className="object-contain"
        />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Login to Your Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={handleLogin}
          >
            Send Magic Link
          </Button>
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}