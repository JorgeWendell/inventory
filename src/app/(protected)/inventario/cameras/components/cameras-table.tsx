"use client";

import { useAction } from "next-safe-action/hooks";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCamerasTable } from "@/actions/get-cameras-table";
import { deleteCamera } from "@/actions/delete-camera";

import CamerasTableRow from "./cameras-table-row";
import CamerasTableActions from "./cameras-table-actions";

interface CameraTableData {
  id: string;
  nome: string;
  intelbrasId: string;
  quantidadeCameras: number;
  nobreak: string;
  localidade: string;
  editadoPor: string;
}

interface CamerasTableProps {
  refreshKey?: number;
  searchTerm?: string;
}

const CamerasTable = ({ refreshKey, searchTerm = "" }: CamerasTableProps) => {
  const [cameras, setCameras] = useState<CameraTableData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCameras = () => {
    setLoading(true);
    getCamerasTable()
      .then(setCameras)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCameras();
  }, [refreshKey]);

  const filteredCameras = useMemo(() => {
    if (!searchTerm) return cameras;

    const searchLower = searchTerm.toLowerCase();
    return cameras.filter(
      (camera) =>
        camera.nome.toLowerCase().includes(searchLower) ||
        camera.localidade.toLowerCase().includes(searchLower) ||
        camera.intelbrasId.toLowerCase().includes(searchLower)
    );
  }, [cameras, searchTerm]);

  const deleteCameraAction = useAction(deleteCamera, {
    onSuccess: () => {
      toast.success("Câmera excluída com sucesso");
      loadCameras();
    },
    onError: () => {
      toast.error("Erro ao excluir câmera");
    },
  });

  const handleDeleteCameraClick = (cameraId: string) => {
    deleteCameraAction.execute({ id: cameraId });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando câmeras...
      </div>
    );
  }

  const hasSearchResults = searchTerm && filteredCameras.length > 0;
  const firstResult = hasSearchResults ? filteredCameras[0] : null;
  const otherResults = hasSearchResults ? filteredCameras.slice(1) : filteredCameras;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marca</TableHead>
            <TableHead>ID Intelbras</TableHead>
            <TableHead>Quant. Câmeras</TableHead>
            <TableHead>Nobreak</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCameras.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhuma câmera encontrada.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {firstResult && (
                <TableRow style={{ backgroundColor: "#b7bbe8" }}>
                  <TableCell className="font-medium">{firstResult.nome}</TableCell>
                  <TableCell>{firstResult.intelbrasId}</TableCell>
                  <TableCell>{firstResult.quantidadeCameras}</TableCell>
                  <TableCell>{firstResult.nobreak}</TableCell>
                  <TableCell>{firstResult.localidade}</TableCell>
                  <TableCell>{firstResult.editadoPor}</TableCell>
                  <TableCell className="text-right">
                    <CamerasTableActions
                      camera={firstResult}
                      onDelete={handleDeleteCameraClick}
                      onEditSuccess={loadCameras}
                    />
                  </TableCell>
                </TableRow>
              )}
              {otherResults.map((camera) => (
                <CamerasTableRow
                  key={camera.id}
                  camera={camera}
                  onDelete={handleDeleteCameraClick}
                  onEditSuccess={loadCameras}
                />
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CamerasTable;

