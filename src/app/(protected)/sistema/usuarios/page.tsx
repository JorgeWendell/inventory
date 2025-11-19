"use client";

import { useEffect, useState } from "react";
import { Shield, User } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { getUsersWithRoles } from "@/actions/get-users-with-roles";
import { updateUserRole } from "@/actions/update-user-role";
import { ProtectedRoute } from "@/components/permissions/protected-route";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userRoleLabels, type UserRole } from "@/constants/user-roles";

const UsuariosPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const updateRoleAction = useAction(updateUserRole, {
    onSuccess: (result) => {
      toast.success(result.data?.message ?? "Role atualizado com sucesso");
      loadUsers();
    },
    onError: (error) => {
      const errorMessage =
        error.error?.serverError ||
        error.error?.thrownError?.message ||
        "Erro ao atualizar role do usuário";
      toast.error(errorMessage);
      console.error("Erro ao atualizar role:", error);
    },
  });

  const loadUsers = async () => {
    try {
      const data = await getUsersWithRoles();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const offset = -3 * 60;
    const localDate = new Date(
      date.getTime() + (offset - date.getTimezoneOffset()) * 60000,
    );
    return localDate.toLocaleDateString("pt-BR");
  };

  return (
    <ProtectedRoute route="/sistema/usuarios">
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <PageTitle>Gerenciamento de Usuários</PageTitle>
            </div>
            <PageDescription>
              Gerencie os níveis de acesso dos usuários do sistema
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="text-muted-foreground h-4 w-4" />
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {(user.role &&
                              userRoleLabels[user.role as UserRole]) ||
                              user.role ||
                              "Desconhecido"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) =>
                              updateRoleAction.execute({
                                userId: user.id,
                                role: value as UserRole,
                              })
                            }
                            disabled={updateRoleAction.status === "executing"}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(userRoleLabels).map(
                                ([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default UsuariosPage;
