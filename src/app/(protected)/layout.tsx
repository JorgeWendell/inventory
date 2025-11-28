import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { auth } from "@/lib/auth";
import { AppSidebar } from "./components/sidebar/app-sidebar";
import { NotificationsBadge } from "./components/notifications-badge";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="flex items-center gap-2 border-b p-2">
          <SidebarTrigger />
          <div className="ml-auto">
            <NotificationsBadge />
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
