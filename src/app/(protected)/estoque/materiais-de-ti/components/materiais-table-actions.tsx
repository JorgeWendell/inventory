"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ShoppingCart } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createSolicitacaoCompra } from "@/actions/create-solicitacao-compra";
import { increaseMaterialStock } from "@/actions/increase-material-stock";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface MateriaisTableActionsProps {
  material: {
    id: string;
    nome: string;
  };
  onStockUpdated?: () => void;
}

const increaseFormSchema = z.object({
  amount: z.coerce
    .number()
    .int()
    .min(1, { message: "Informe a quantidade a ser adicionada" }),
});

const MateriaisTableActions = ({
  material,
  onStockUpdated,
}: MateriaisTableActionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof increaseFormSchema>>({
    resolver: zodResolver(increaseFormSchema),
    defaultValues: {
      amount: 1,
    },
  });

  const increaseStockAction = useAction(increaseMaterialStock, {
    onSuccess: (result) => {
      toast.success(result.data?.message ?? "Estoque atualizado");
      form.reset({ amount: 1 });
      setIsDialogOpen(false);
      onStockUpdated?.();
    },
    onError: (error) => {
      const message = error.error?.serverError ?? "Erro ao atualizar estoque";
      toast.error(message);
    },
  });

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

  const onSubmit = (values: z.infer<typeof increaseFormSchema>) => {
    increaseStockAction.execute({
      id: material.id,
      amount: values.amount,
    });
  };

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="mr-1 h-4 w-4" />
            Adicionar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar estoque</DialogTitle>
            <DialogDescription>
              Informe a quantidade que deseja adicionar para {material.nome}.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={increaseStockAction.status === "executing"}
                >
                  {increaseStockAction.status === "executing"
                    ? "Salvando..."
                    : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          createSolicitacaoAction.execute({
            materialId: material.id,
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

export default MateriaisTableActions;


