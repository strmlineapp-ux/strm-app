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
  Library,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarNav = () => {
  const pathname = usePathname();

  const mainNav = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/analysis", icon: NotebookPen, label: "Analysis" },
  ];

  const secondaryNav = [
    { href: "/collections", icon: Library, label: "My Collections" },
    { href: "/projects", icon: FolderKanban, label: "My Projects" },
    { href: "/shared", icon: Share2, label: "Shared" },
  ];

  const projectNav = [
    { href: "/#calendar", icon: Calendar, label: "Calendar" },
    { href: "/#tasks", icon: ListTodo, label: "Tasks" },
    { href: "/#files", icon: FileText, label: "Files" },
    { href: "/#team", icon: Users, label: "Team" },
  ];

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
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
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
          <SidebarSeparator />
          {secondaryNav.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
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
          <SidebarSeparator />
          {projectNav.map((item) => (
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
