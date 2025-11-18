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
import { camerasTable } from "@/db/schema";
import { getCameraById } from "@/actions/get-camera-by-id";

import UpsertCameraForm from "./upsert-camera-form";

interface CamerasTableActionsProps {
  camera: {
    id: string;
    nome: string;
    intelbrasId: string;
    quantidadeCameras: number;
    nobreak: string;
    localidade: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const CamerasTableActions = ({
  camera,
  onDelete,
  onEditSuccess,
}: CamerasTableActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [cameraCompleta, setCameraCompleta] = useState<typeof camerasTable.$inferSelect | null>(null);

  useEffect(() => {
    if (isEditDialogOpen) {
      getCameraById(camera.id).then(setCameraCompleta);
    }
  }, [isEditDialogOpen, camera.id]);

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setCameraCompleta(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {cameraCompleta && (
          <UpsertCameraForm
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            camera={cameraCompleta}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setCameraCompleta(null);
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
              Tem certeza que deseja deletar esta câmera?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A câmera{" "}
              <strong>{camera.nome}</strong> será permanentemente
              removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(camera.id)}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CamerasTableActions;

