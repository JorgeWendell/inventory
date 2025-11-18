"use client";

import { Edit, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { usuarioTable } from "@/db/schema";
import { getUsuarioById } from "@/actions/get-usuario-by-id";

import UpsertUsuarioForm from "./upsert-usuario-form";

interface UsuariosTableActionsProps {
  usuario: {
    id: string;
    login: string;
    nome: string;
    depto: string;
    localidadeNome: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const UsuariosTableActions = ({
  usuario,
  onDelete,
  onEditSuccess,
}: UsuariosTableActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [usuarioCompleto, setUsuarioCompleto] = useState<typeof usuarioTable.$inferSelect | null>(null);

  useEffect(() => {
    if (isEditDialogOpen) {
      getUsuarioById(usuario.id).then(setUsuarioCompleto);
    }
  }, [isEditDialogOpen, usuario.id]);

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setUsuarioCompleto(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {usuarioCompleto && (
          <UpsertUsuarioForm
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            usuario={usuarioCompleto}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setUsuarioCompleto(null);
              onEditSuccess?.();
            }}
          />
        )}
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja deletar este usuário?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário{" "}
              <strong>{usuario.nome}</strong> será permanentemente
              removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(usuario.id)}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsuariosTableActions;

