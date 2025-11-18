"use client";

import { useAction } from "next-safe-action/hooks";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsuariosTable } from "@/actions/get-usuarios-table";
import { deleteUsuario } from "@/actions/delete-usuario";

import UsuariosTableRow from "./usuarios-table-row";
import UsuariosTableActions from "./usuarios-table-actions";

interface UsuarioTableData {
  id: string;
  login: string;
  nome: string;
  depto: string;
  localidadeNome: string;
  editadoPor: string;
}

interface UsuariosTableProps {
  refreshKey?: number;
  searchTerm?: string;
}

const UsuariosTable = ({ refreshKey, searchTerm = "" }: UsuariosTableProps) => {
  const [usuarios, setUsuarios] = useState<UsuarioTableData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsuarios = () => {
    setLoading(true);
    getUsuariosTable()
      .then(setUsuarios)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsuarios();
  }, [refreshKey]);

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) return usuarios;

    const searchLower = searchTerm.toLowerCase();
    return usuarios.filter(
      (usuario) =>
        usuario.login.toLowerCase().includes(searchLower) ||
        usuario.nome.toLowerCase().includes(searchLower)
    );
  }, [usuarios, searchTerm]);

  const deleteUsuarioAction = useAction(deleteUsuario, {
    onSuccess: () => {
      toast.success("Usuário excluído com sucesso");
      loadUsuarios();
    },
    onError: () => {
      toast.error("Erro ao excluir usuário");
    },
  });

  const handleDeleteUsuarioClick = (usuarioId: string) => {
    deleteUsuarioAction.execute({ id: usuarioId });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando usuários...
      </div>
    );
  }

  const hasSearchResults = searchTerm && filteredUsuarios.length > 0;
  const firstResult = hasSearchResults ? filteredUsuarios[0] : null;
  const otherResults = hasSearchResults ? filteredUsuarios.slice(1) : filteredUsuarios;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Login</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {firstResult && (
                <TableRow style={{ backgroundColor: "#b7bbe8" }}>
                  <TableCell className="font-medium">{firstResult.login}</TableCell>
                  <TableCell>{firstResult.nome}</TableCell>
                  <TableCell>{firstResult.depto}</TableCell>
                  <TableCell>{firstResult.localidadeNome}</TableCell>
                  <TableCell>{firstResult.editadoPor}</TableCell>
                  <TableCell className="text-right">
                    <UsuariosTableActions
                      usuario={firstResult}
                      onDelete={handleDeleteUsuarioClick}
                      onEditSuccess={loadUsuarios}
                    />
                  </TableCell>
                </TableRow>
              )}
              {otherResults.map((usuario) => (
                <UsuariosTableRow
                  key={usuario.id}
                  usuario={usuario}
                  onDelete={handleDeleteUsuarioClick}
                  onEditSuccess={loadUsuarios}
                />
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsuariosTable;

