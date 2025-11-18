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
import { impressoraTable } from "@/db/schema";
import { getImpressoraById } from "@/actions/get-impressora-by-id";

import UpsertImpressoraForm from "./upsert-impressora-form";

interface ImpressorasTableActionsProps {
  impressora: {
    id: string;
    nome: string;
    marca: string;
    modelo: string;
    localidadeNome: string;
    manutencao: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const ImpressorasTableActions = ({
  impressora,
  onDelete,
  onEditSuccess,
}: ImpressorasTableActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [impressoraCompleta, setImpressoraCompleta] = useState<typeof impressoraTable.$inferSelect | null>(null);

  useEffect(() => {
    if (isEditDialogOpen) {
      getImpressoraById(impressora.id).then(setImpressoraCompleta);
    }
  }, [isEditDialogOpen, impressora.id]);

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setImpressoraCompleta(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {impressoraCompleta && (
          <UpsertImpressoraForm
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            impressora={impressoraCompleta}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setImpressoraCompleta(null);
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
              Tem certeza que deseja deletar esta impressora?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A impressora{" "}
              <strong>{impressora.nome}</strong> será permanentemente
              removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(impressora.id)}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ImpressorasTableActions;

