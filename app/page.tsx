"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center space-y-10">
      <Input />
      <Button>Login</Button>
    </main>
  );
}
