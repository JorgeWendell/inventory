"use client";

import { ShoppingCart, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { createSolicitacaoCompra } from "@/actions/create-solicitacao-compra";
import { getTonerById } from "@/actions/get-toner-by-id";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { tonerTable } from "@/db/schema";

import UpsertTonerForm from "./upsert-toner-form";

interface TonersTableActionsProps {
  toner: {
    id: string;
    nome: string;
    cor: string;
    impressoraNome: string;
    localidadeNome: string;
    estoqueAtual: number;
    editadoPor: string;
  };
  onEditSuccess?: () => void;
}

const TonersTableActions = ({ toner, onEditSuccess }: TonersTableActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tonerCompleto, setTonerCompleto] = useState<typeof tonerTable.$inferSelect | null>(null);

  useEffect(() => {
    if (isEditDialogOpen) {
      getTonerById(toner.id).then(setTonerCompleto);
    }
  }, [isEditDialogOpen, toner.id]);

  const createSolicitacaoAction = useAction(createSolicitacaoCompra, {
    onSuccess: (result) => {
      toast.success(result.data?.message ?? "Solicitação de compra criada");
    },
    onError: (error) => {
      const message =
        error.error?.serverError ?? "Erro ao criar solicitação de compra";
      toast.error(message);
    },
  });

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setTonerCompleto(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {tonerCompleto && (
          <UpsertTonerForm
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            toner={tonerCompleto}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setTonerCompleto(null);
              onEditSuccess?.();
            }}
          />
        )}
      </Dialog>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          createSolicitacaoAction.execute({
            tipoProduto: "TONER",
            tonerId: toner.id,
            cor: toner.cor as "Preta" | "Amarela" | "Magenta" | "Azul" | undefined,
            quantidade: 1,
          })
        }
        disabled={createSolicitacaoAction.status === "executing"}
      >
        <ShoppingCart className="mr-1 h-4 w-4" />
        {createSolicitacaoAction.status === "executing"
          ? "Enviando..."
          : "Solicitar compra"}
      </Button>
    </div>
  );
};

export default TonersTableActions;
