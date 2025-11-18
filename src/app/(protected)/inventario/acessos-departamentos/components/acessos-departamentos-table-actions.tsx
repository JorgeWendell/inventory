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
import { acessosDepartamentosTable } from "@/db/schema";
import { getAcessoDepartamentoById } from "@/actions/get-acesso-departamento-by-id";

import UpsertAcessoDepartamentoForm from "./upsert-acesso-departamento-form";

interface AcessosDepartamentosTableActionsProps {
  acessoDepartamento: {
    id: string;
    usuarioLogin: string;
    computadorNome: string;
    pastaDepartamentos: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const AcessosDepartamentosTableActions = ({
  acessoDepartamento,
  onDelete,
  onEditSuccess,
}: AcessosDepartamentosTableActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [acessoDepartamentoCompleto, setAcessoDepartamentoCompleto] = useState<typeof acessosDepartamentosTable.$inferSelect | null>(null);

  useEffect(() => {
    if (isEditDialogOpen) {
      getAcessoDepartamentoById(acessoDepartamento.id).then(setAcessoDepartamentoCompleto);
    }
  }, [isEditDialogOpen, acessoDepartamento.id]);

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setAcessoDepartamentoCompleto(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {acessoDepartamentoCompleto && (
          <UpsertAcessoDepartamentoForm
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            acessoDepartamento={acessoDepartamentoCompleto}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setAcessoDepartamentoCompleto(null);
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
              Tem certeza que deseja deletar este acesso?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O acesso{" "}
              <strong>{acessoDepartamento.usuarioLogin} - {acessoDepartamento.computadorNome}</strong> será permanentemente
              removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(acessoDepartamento.id)}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AcessosDepartamentosTableActions;

