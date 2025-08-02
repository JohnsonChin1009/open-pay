"use client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfileButton() {
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [fallbackInitial, setFallbackInitial] = useState<string>("");
  const router = useRouter();

  const handleClickLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-up");
  };
  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Failed to fetch user:", error);
        return;
      }

      const metadata = user.user_metadata;
      console.log("Metadata fetched", metadata);
      // Use profile picture from Google OAuth
      setAvatarURL(metadata?.picture || null);

      // Fallback: use first letter of name or email
      const name = metadata?.name || user.email || "U";
      setFallbackInitial(name.charAt(0).toUpperCase());
    };

    getUserData();
  }, []);

  return (
    <div
      className="border border-transparent hover:border-black rounded-full"
      onClick={handleClickLogout}
    >
      <Avatar className="size-12">
        <AvatarImage src={avatarURL || ""} />
        <AvatarFallback>{fallbackInitial}</AvatarFallback>
      </Avatar>
    </div>
  );
}
