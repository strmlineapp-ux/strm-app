"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Calendar,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  NotebookPen,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarNav = () => {
  const pathname = usePathname();

  const menuItems = [
    { href: "/#dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/#projects", icon: FolderKanban, label: "Projects" },
    { href: "/#calendar", icon: Calendar, label: "Calendar" },
    { href: "/#tasks", icon: ListTodo, label: "Tasks" },
    { href: "/#files", icon: FileText, label: "Files" },
    { href: "/#team", icon: Users, label: "Team" },
  ];

  const analysisItem = { href: "/", icon: NotebookPen, label: "Analysis" };
  const settingsItem = {
    href: "/#settings",
    icon: Settings,
    label: "Settings",
  };

  const isActive = (path: string) => path === pathname;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
              S
            </AvatarFallback>
          </Avatar>
          <span className="font-headline text-lg font-bold text-foreground group-data-[collapsible=icon]:hidden">
            Strm_
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive(analysisItem.href)}
              tooltip={{
                children: analysisItem.label,
                side: "right",
                align: "center",
              }}
            >
              <Link href={analysisItem.href}>
                <analysisItem.icon />
                <span>{analysisItem.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator />

          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                tooltip={{
                  children: item.label,
                  side: "right",
                  align: "center",
                }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={{
                children: settingsItem.label,
                side: "right",
                align: "center",
              }}
            >
              <Link href={settingsItem.href}>
                <settingsItem.icon />
                <span>{settingsItem.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <div className="flex items-center gap-3 p-2">
          <Avatar className="size-8">
            <AvatarImage
              src="https://placehold.co/100x100.png"
              alt="User"
              data-ai-hint="person face"
            />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium text-foreground">
              Admin User
            </span>
            <span className="truncate text-xs text-muted-foreground">
              admin@strm.co
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarNav;
