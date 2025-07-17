"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

export default function ChatArea() {
    return (
        <>
            <div className="flex space-x-2">
                <Input placeholder="How can I help you?" required/>
                <Button>
                    <Mic size={16} />
                </Button>
            </div>
        </>
    )
}