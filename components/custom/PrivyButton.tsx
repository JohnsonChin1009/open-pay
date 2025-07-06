"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { FcGoogle } from "react-icons/fc";

export default function PrivyButton() {
    const { ready, authenticated, login, logout, user } = usePrivy();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Helper to truncate address
    const truncateAddress = (address: string) => {
        return address.slice(0, 6) + '...' + address.slice(-4);
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

    if (!ready) return null;

    return (
        <>
            {!authenticated ? (
                <Button onClick={login} className="flex items-center gap-2">
                    <FcGoogle className="text-lg" /> Sign In
                </Button>
            ) : (
                <div className="relative" ref={dropdownRef}>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setDropdownOpen((open) => !open)}
                    >
                        <FcGoogle className="text-lg" />
                        {truncateAddress(user?.wallet?.address || "")}
                    </Button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                onClick={() => { setDropdownOpen(false); logout(); }}
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}