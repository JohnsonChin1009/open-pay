"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LogoAnimation() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 1500); // Adjust if needed

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <motion.div
        className="flex items-center" // was space-x-4
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Image src="/logo1.png" alt="Logo" width={100} height={100} />

        <motion.h1
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-gray-800"
        >
          penPay
        </motion.h1>
      </motion.div>
    </div>
  );
}
