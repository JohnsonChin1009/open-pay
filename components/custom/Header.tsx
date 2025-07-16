"use client";

import { Notebook } from "lucide-react";
import ToggleThemeButton from "@/components/custom/ToggleThemeButton";

export default function Header() {
    return (
        <header className="flex items-center justify-between py-4">
            <div><Notebook /></div> {/* TODO: Change to a better icon */}
            <div>openpay</div>
            <ToggleThemeButton />
        </header>
    )
}