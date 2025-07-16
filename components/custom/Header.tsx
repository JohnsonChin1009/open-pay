"use client";

import { Notebook } from "lucide-react";
import ToggleThemeButton from "@/components/custom/ToggleThemeButton";

export default function Header() {
    return (
        <header className="flex items-center justify-between py-4">
            <div></div>
            <div></div>
            <ToggleThemeButton />
        </header>
    )
}