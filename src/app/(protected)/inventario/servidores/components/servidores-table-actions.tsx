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
import { servidorTable } from "@/db/schema";
import { getServidorById } from "@/actions/get-servidor-by-id";

import UpsertServidorForm from "./upsert-servidor-form";

interface ServidoresTableActionsProps {
  servidor: {
    id: string;
    nome: string;
    funcao: string;
    vm: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const ServidoresTableActions = ({
  servidor,
  onDelete,
  onEditSuccess,
}: ServidoresTableActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [servidorCompleto, setServidorCompleto] = useState<typeof servidorTable.$inferSelect | null>(null);

  useEffect(() => {
    if (isEditDialogOpen) {
      getServidorById(servidor.id).then(setServidorCompleto);
    }
  }, [isEditDialogOpen, servidor.id]);

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setServidorCompleto(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {servidorCompleto && (
          <UpsertServidorForm
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            servidor={servidorCompleto}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setServidorCompleto(null);
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
              Tem certeza que deseja deletar este servidor?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O servidor{" "}
              <strong>{servidor.nome}</strong> será permanentemente
              removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(servidor.id)}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServidoresTableActions;

