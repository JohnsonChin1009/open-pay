"use client";

import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarFooter } from "@/components/ui/sidebar";

export default function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader />
                <SidebarContent>
                    <SidebarGroup />
                    <SidebarGroup />
                </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}