import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "./components/sidebar/app-sidebar";
import { NotificationsBadge } from "./components/notifications-badge";

export default function Layout({ children }: { children: React.ReactNode }) {
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
