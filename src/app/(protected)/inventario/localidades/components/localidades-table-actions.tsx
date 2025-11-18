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
import { localidadeTable } from "@/db/schema";
import { getLocalidadeById } from "@/actions/get-localidade-by-id";

import UpsertLocalidadeForm from "./upsert-localidade-form";

interface LocalidadesTableActionsProps {
  localidade: {
    id: string;
    nome: string;
    endereco: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const LocalidadesTableActions = ({
  localidade,
  onDelete,
  onEditSuccess,
}: LocalidadesTableActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [localidadeCompleta, setLocalidadeCompleta] = useState<typeof localidadeTable.$inferSelect | null>(null);

  useEffect(() => {
    if (isEditDialogOpen) {
      getLocalidadeById(localidade.id).then(setLocalidadeCompleta);
    }
  }, [isEditDialogOpen, localidade.id]);

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setLocalidadeCompleta(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {localidadeCompleta && (
          <UpsertLocalidadeForm
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            localidade={localidadeCompleta}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setLocalidadeCompleta(null);
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
              Tem certeza que deseja deletar esta localidade?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A localidade{" "}
              <strong>{localidade.nome}</strong> será permanentemente
              removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(localidade.id)}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LocalidadesTableActions;

