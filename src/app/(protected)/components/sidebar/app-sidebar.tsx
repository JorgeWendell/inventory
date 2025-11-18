"use client";

import {
  Bell,
  CameraIcon,
  Cctv,
  Computer,
  FileText,
  Grid2x2,
  LayoutDashboard,
  LogOut,
  MapPin,
  Monitor,
  Moon,
  Power,
  Printer,
  ServerIcon,
  Sun,
  Users,
  UsersIcon,
  FileSearch,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

import { NavMain } from "./nav-main";

// This is sample data.
// Label = modules  - items = menus  - title = o que vai fazer
const data = {
  navMain: [
    {
      label: "Dashboard",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: FileText,
          items: [
            {
              title: "Dashboard",
              icon: LayoutDashboard,
              url: "/dashboard",
            },
          ],
        },
      ],
    },
    {
      label: "Estoque",
      items: [
        {
          title: "Estoque",
          url: "/estoque",
          icon: FileText,
          items: [
            {
              title: "Materias de TI",
              icon: Cctv,
              url: "/estoque/materiais-de-ti",
            },
          ],
        },
      ],
    },
    {
      label: "Inventário",
      items: [
        {
          title: "Inventário",
          url: "/inventario",
          icon: LayoutDashboard,
          items: [
            {
              title: "Usuarios",
              icon: Users,
              url: "/inventario/usuarios",
            },
            {
              title: "Localidades",
              icon: MapPin,
              url: "/inventario/localidades",
            },
            {
              title: "Computadores",
              icon: Computer,
              url: "/inventario/computadores",
            },
            {
              title: "Monitores",
              icon: Monitor,
              url: "/inventario/monitores",
            },
            {
              title: "Impressoras",
              icon: Printer,
              url: "/inventario/impressoras",
            },
            {
              title: "Toners",
              icon: Printer,
              url: "/inventario/toners",
            },
            {
              title: "Nobreaks",
              icon: Power,
              url: "/inventario/nobreaks",
            },
            {
              title: "Câmeras",
              icon: Cctv,
              url: "/inventario/cameras",
            },

            {
              title: "Office",
              icon: Grid2x2,
              url: "/inventario/office",
            },
            {
              title: "Acessos Departamentos",
              icon: UsersIcon,
              url: "/inventario/acessos-departamentos",
            },
            {
              title: "Servidores",
              icon: ServerIcon,
              url: "/inventario/servidores",
            },
          ],
        },
      ],
    },

    {
      label: "Solicitações",
      items: [
        {
          title: "Solicitações",
          url: "/solicitacoes",
          icon: FileText,
          items: [
            {
              title: "Pedido Interno",
              icon: FileText,
              url: "/solicitacoes/pedido-interno",
            },
            {
              title: "Solicitação de Compra",
              icon: FileText,
              url: "/solicitacoes/solicitacao-de-compra",
            },
          ],
        },
      ],
    },
    {
      label: "Sistema",
      items: [
        {
          title: "Notificações",
          url: "/notificacoes",
          icon: Bell,
          items: [
            {
              title: "Notificações",
              icon: Bell,
              url: "/notificacoes",
            },
          ],
        },
        {
          title: "Logs",
          url: "/logs",
          icon: FileSearch,
          items: [
            {
              title: "Logs",
              icon: FileText,
              url: "/logs",
            },
          ],
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const session = authClient.useSession();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <Image
        src="/logo.png"
        alt="Logo"
        width={150}
        height={150}
        className="mx-auto mt-4"
      />
      <SidebarContent>
        <NavMain groups={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar>
                    <AvatarFallback>
                      {session.data?.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{session.data?.user.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {session.data?.user.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={toggleTheme}>
                  {mounted && theme === "dark" ? (
                    <>
                      <Sun />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Moon />
                      Dark Mode
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
