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
import { computadoresTable } from "@/db/schema";
import { getComputadorById } from "@/actions/get-computador-by-id";

import UpsertComputadorForm from "./upsert-computador-form";

interface ComputadoresTableActionsProps {
  computador: {
    id: string;
    nome: string;
    marca: string;
    modelo: string;
    localidadeNome: string;
    usuarioNome: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const ComputadoresTableActions = ({
  computador,
  onDelete,
  onEditSuccess,
}: ComputadoresTableActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [computadorCompleto, setComputadorCompleto] = useState<typeof computadoresTable.$inferSelect | null>(null);

  useEffect(() => {
    if (isEditDialogOpen) {
      getComputadorById(computador.id).then(setComputadorCompleto);
    }
  }, [isEditDialogOpen, computador.id]);

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setComputadorCompleto(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {computadorCompleto && (
          <UpsertComputadorForm
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            computador={computadorCompleto}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setComputadorCompleto(null);
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
              Tem certeza que deseja deletar este computador?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O computador{" "}
              <strong>{computador.nome}</strong> será permanentemente
              removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(computador.id)}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ComputadoresTableActions;

