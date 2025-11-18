"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertLocalidade } from "@/actions/upsert-localidade";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { localidadeTable } from "@/db/schema";

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  endereco: z.string().optional(),
});

interface UpsertLocalidadeFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  localidade?: typeof localidadeTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertLocalidadeForm = ({
  open,
  setOpen,
  localidade = null,
  onSuccess,
}: UpsertLocalidadeFormProps) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: localidade?.nome || "",
      endereco: localidade?.endereco || "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    } else if (localidade) {
      form.reset({
        nome: localidade.nome,
        endereco: localidade.endereco || "",
      });
    }
  }, [open, form, localidade]);

  const upsertLocalidadeAction = useAction(upsertLocalidade, {
    onSuccess: (result) => {
      toast.success(
        result.data?.message || "Localidade cadastrada com sucesso!",
      );
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro ao cadastrar localidade:", error);
      const errorMessage =
        error?.error?.serverError || "Erro ao cadastrar localidade";
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      ...(localidade ? { id: localidade.id } : {}),
    };
    upsertLocalidadeAction.execute(payload);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {localidade ? "Editar Localidade" : "Nova Localidade"}
        </DialogTitle>
        <DialogDescription>
          {localidade
            ? "Atualize as informações da localidade"
            : "Preencha o formulário abaixo para cadastrar uma nova localidade"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da localidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Endereço da localidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={upsertLocalidadeAction.status === "executing"}
            >
              {upsertLocalidadeAction.status === "executing"
                ? "Salvando..."
                : localidade
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertLocalidadeForm;

