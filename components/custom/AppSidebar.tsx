"use client";

import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <button className="w-full text-left">openpay</button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup />
                    <SidebarGroup />
                </SidebarContent>
            <SidebarFooter className="pb-10">
                <SidebarMenu className="flex items-start">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Button variant="link" className="space-x-4">
                                <Avatar>
                                    <AvatarImage src="" alt="User Avatar" />
                                    <AvatarFallback>JC</AvatarFallback>
                                </Avatar>
                                <span>Profile</span>
                            </Button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}