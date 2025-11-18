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
import { nobreakTable } from "@/db/schema";
import { getNobreakById } from "@/actions/get-nobreak-by-id";

import UpsertNobreakForm from "./upsert-nobreak-form";

interface NobreaksTableActionsProps {
  nobreak: {
    id: string;
    marca: string;
    modelo: string;
    capacidade: string;
    localidadeNome: string;
    usuarioNome: string;
    computadoresNome: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const NobreaksTableActions = ({
  nobreak,
  onDelete,
  onEditSuccess,
}: NobreaksTableActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [nobreakCompleto, setNobreakCompleto] = useState<typeof nobreakTable.$inferSelect | null>(null);

  useEffect(() => {
    if (isEditDialogOpen) {
      getNobreakById(nobreak.id).then(setNobreakCompleto);
    }
  }, [isEditDialogOpen, nobreak.id]);

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setNobreakCompleto(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {nobreakCompleto && (
          <UpsertNobreakForm
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            nobreak={nobreakCompleto}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setNobreakCompleto(null);
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
              Tem certeza que deseja deletar este nobreak?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O nobreak{" "}
              <strong>{nobreak.marca} {nobreak.modelo}</strong> será permanentemente
              removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(nobreak.id)}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NobreaksTableActions;

