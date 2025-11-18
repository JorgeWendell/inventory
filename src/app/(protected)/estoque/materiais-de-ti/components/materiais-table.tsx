"use client";

import { useEffect, useState } from "react";

import { getMateriaisDeTiTable } from "@/actions/get-materiais-de-ti-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import MateriaisTableRow from "./materiais-table-row";

export interface MaterialTableData {
  id: string;
  nome: string;
  categoria: string;
  estoqueMin: number;
  estoqueAtual: number;
  localidadeNome: string;
  editadoPor: string;
}

interface MateriaisTableProps {
  refreshKey?: number;
}

const MateriaisTable = ({ refreshKey = 0 }: MateriaisTableProps) => {
  const [materiais, setMateriais] = useState<MaterialTableData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMateriais = () => {
    setLoading(true);
    getMateriaisDeTiTable()
      .then((data) => setMateriais(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMateriais();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Carregando materiais...
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Estoque mínimo</TableHead>
            <TableHead>Estoque atual</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materiais.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhum material cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            materiais.map((material) => (
              <MateriaisTableRow
                key={material.id}
                material={material}
                onStockUpdated={loadMateriais}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MateriaisTable;


