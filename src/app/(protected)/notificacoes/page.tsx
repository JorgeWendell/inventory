"use client";

import { useEffect, useState } from "react";
import { Check, CheckCheck, Bell, AlertCircle, Package, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getNotificacoes } from "@/actions/get-notificacoes";
import { marcarNotificacaoLida } from "@/actions/marcar-notificacao-lida";
import { marcarTodasNotificacoesLidas } from "@/actions/marcar-todas-notificacoes-lidas";
import { authClient } from "@/lib/auth-client";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageActions,
} from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NotificacoesPage = () => {
  const router = useRouter();
  const session = authClient.useSession();
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todas" | "nao-lidas">("todas");

  const loadNotifications = async () => {
    if (!session.data?.user?.id) return;

    try {
      const notifs = await getNotificacoes(
        session.data.user.id,
        filter === "nao-lidas",
      );
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
    }
  }, [session.data?.user?.id, filter]);

  const handleMarkAsRead = async (notifId: string, link?: string | null) => {
    if (!session.data?.user?.id) return;

    try {
      await marcarNotificacaoLida(notifId, session.data.user.id);
      await loadNotifications();
      if (link) {
        router.push(link);
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

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "estoque_baixo":
        return <Package className="h-5 w-5" />;
      case "solicitacao_pendente":
        return <ShoppingCart className="h-5 w-5" />;
      case "pedido_pendente":
        return <Package className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const offset = -3 * 60;
    const localDate = new Date(
      date.getTime() + (offset - date.getTimezoneOffset()) * 60000,
    );
    return localDate.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!session.data?.user?.id) {
    return null;
  }

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Notificações</PageTitle>
          <PageDescription>
            Gerencie suas notificações e alertas do sistema
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "todas" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("todas")}
            >
              Todas ({notificacoes.length})
            </Button>
            <Button
              variant={filter === "nao-lidas" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("nao-lidas")}
            >
              Não lidas ({naoLidas})
            </Button>
            {naoLidas > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </PageActions>
      </PageHeader>
      <PageContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Carregando notificações...</p>
          </div>
        ) : notificacoes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Nenhuma notificação</p>
              <p className="text-sm text-muted-foreground">
                Você não tem notificações no momento
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notificacoes.map((notif) => (
              <Card
                key={notif.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  !notif.lida && "border-l-4 border-l-blue-500",
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={cn(
                          "mt-1 rounded-full p-2",
                          !notif.lida
                            ? "bg-blue-100 dark:bg-blue-900"
                            : "bg-muted",
                        )}
                      >
                        {getTipoIcon(notif.tipo)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">
                            {notif.titulo}
                          </CardTitle>
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              getPriorityColor(notif.prioridade),
                            )}
                          />
                          {!notif.lida && (
                            <Badge variant="secondary" className="text-xs">
                              Nova
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {notif.mensagem}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notif.lida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Marcar como lida
                        </Button>
                      )}
                      {notif.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleMarkAsRead(notif.id, notif.link);
                          }}
                        >
                          Ver detalhes
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default NotificacoesPage;

