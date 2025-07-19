"use client";

import { Languages } from "lucide-react";

export default function ToggleLanguageButton() {
    return (
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        aria-label="Toggle language">
            <Languages size={20}/>
        </button>
    )
}