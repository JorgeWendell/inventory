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
import { officeTable } from "@/db/schema";
import { getOfficeById } from "@/actions/get-office-by-id";

import UpsertOfficeForm from "./upsert-office-form";

interface OfficeTableActionsProps {
  office: {
    id: string;
    nome: string;
    senha: string;
    computadorNome: string;
    usuarioNome: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const OfficeTableActions = ({
  office,
  onDelete,
  onEditSuccess,
}: OfficeTableActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [officeCompleto, setOfficeCompleto] = useState<typeof officeTable.$inferSelect | null>(null);

  useEffect(() => {
    if (isEditDialogOpen) {
      getOfficeById(office.id).then(setOfficeCompleto);
    }
  }, [isEditDialogOpen, office.id]);

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setOfficeCompleto(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {officeCompleto && (
          <UpsertOfficeForm
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            office={officeCompleto}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setOfficeCompleto(null);
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
              Tem certeza que deseja deletar esta licença Office?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A licença{" "}
              <strong>{office.nome}</strong> será permanentemente
              removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(office.id)}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OfficeTableActions;

