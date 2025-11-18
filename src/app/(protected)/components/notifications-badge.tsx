"use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getNotificacoesCount } from "@/actions/get-notificacoes-count";
import { getNotificacoes } from "@/actions/get-notificacoes";
import { marcarNotificacaoLida } from "@/actions/marcar-notificacao-lida";
import { marcarTodasNotificacoesLidas } from "@/actions/marcar-todas-notificacoes-lidas";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function NotificationsBadge() {
  const router = useRouter();
  const session = authClient.useSession();
  const [count, setCount] = useState({ total: 0, criticas: 0, altas: 0 });
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadNotifications = async () => {
    if (!session.data?.user?.id) return;

    try {
      const [countData, notifs] = await Promise.all([
        getNotificacoesCount(session.data.user.id),
        getNotificacoes(session.data.user.id, true),
      ]);
      setCount(countData);
      setNotificacoes(notifs);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session.data?.user?.id) {
      loadNotifications();
      // Auto-refresh a cada 30 segundos
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session.data?.user?.id]);

  const handleMarkAsRead = async (notifId: string, link?: string | null) => {
    if (!session.data?.user?.id) return;

    try {
      await marcarNotificacaoLida(notifId, session.data.user.id);
      await loadNotifications();
      if (link) {
        router.push(link);
        setOpen(false);
      }
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!session.data?.user?.id) return;

    try {
      await marcarTodasNotificacoesLidas(session.data.user.id);
      await loadNotifications();
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case "critica":
        return "bg-red-500";
      case "alta":
        return "bg-orange-500";
      case "normal":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  if (!mounted || !session.data?.user?.id) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count.total > 0 && (
            <Badge
              className={cn(
                "absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs",
                count.criticas > 0
                  ? "bg-red-500"
                  : count.altas > 0
                    ? "bg-orange-500"
                    : "bg-blue-500",
              )}
            >
              {count.total > 99 ? "99+" : count.total}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {count.total > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-0 text-xs"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notificacoes.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="flex flex-col items-start gap-2 p-3"
                onClick={() => handleMarkAsRead(notif.id, notif.link)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          getPriorityColor(notif.prioridade),
                        )}
                      />
                      <span className="text-sm font-medium">
                        {notif.titulo}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {notif.mensagem}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.lida && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <Link href="/notificacoes" className="w-full">
          <DropdownMenuItem className="w-full justify-center">
            Ver todas as notificações
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

