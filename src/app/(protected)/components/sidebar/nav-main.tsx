"use client";

import { useEffect, useState } from "react";
import { ChevronRight, LucideIcon } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { canAccessRoute } from "@/lib/permissions";
import { UserRole } from "@/constants/user-roles";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  groups,
}: {
  groups: {
    label: string;
    items: {
      title: string;
      url: string;
      icon?: LucideIcon;
      isActive?: boolean;
      items?: {
        title: string;
        url: string;
        icon?: LucideIcon;
      }[];
    }[];
  }[];
}) {
  const session = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = mounted
    ? ((session.data?.user as any)?.role as UserRole | undefined)
    : undefined;

  const filterItems = (items: typeof groups[0]["items"]) => {
    return items
      .map((item) => {
        if (!canAccessRoute(userRole, item.url)) {
          return null;
        }

        const filteredSubItems = item.items?.filter((subItem) =>
          canAccessRoute(userRole, subItem.url),
        );

        return {
          ...item,
          items: filteredSubItems && filteredSubItems.length > 0 ? filteredSubItems : undefined,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  return (
    <>
      {groups.map((group) => {
        const filteredItems = filterItems(group.items);
        if (filteredItems.length === 0) return null;

        return (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {item.items && item.items.length > 0 && (
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {item.items && item.items.length > 0 && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url}>
                                  {subItem.icon && <subItem.icon />}
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}
