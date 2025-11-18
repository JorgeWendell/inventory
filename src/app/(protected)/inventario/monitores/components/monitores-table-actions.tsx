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
import { monitorTable } from "@/db/schema";
import { getMonitorById } from "@/actions/get-monitor-by-id";

import UpsertMonitorForm from "./upsert-monitor-form";

interface MonitoresTableActionsProps {
  monitor: {
    id: string;
    marca: string;
    modelo: string;
    usuarioNome: string;
    localidadeNome: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const MonitoresTableActions = ({
  monitor,
  onDelete,
  onEditSuccess,
}: MonitoresTableActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [monitorCompleto, setMonitorCompleto] = useState<typeof monitorTable.$inferSelect | null>(null);

  useEffect(() => {
    if (isEditDialogOpen) {
      getMonitorById(monitor.id).then(setMonitorCompleto);
    }
  }, [isEditDialogOpen, monitor.id]);

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setMonitorCompleto(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {monitorCompleto && (
          <UpsertMonitorForm
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            monitor={monitorCompleto}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setMonitorCompleto(null);
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
              Tem certeza que deseja deletar este monitor?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O monitor{" "}
              <strong>{monitor.marca} {monitor.modelo}</strong> será permanentemente
              removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(monitor.id)}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MonitoresTableActions;

