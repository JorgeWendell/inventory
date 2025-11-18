"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertToner } from "@/actions/upsert-toner";
import { getLocalidades } from "@/actions/get-localidades";
import { getImpressoras } from "@/actions/get-impressoras";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tonerTable } from "@/db/schema";

const coresEnum = z.enum(["Preta", "Amarela", "Magenta", "Azul"]);

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  cor: coresEnum.optional(),
  localidadeNome: z.string().optional(),
  impressoraNome: z.string().optional(),
  estoqueMin: z.number().int().min(0),
  estoqueAtual: z.number().int().min(0),
});

interface UpsertTonerFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  toner?: typeof tonerTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertTonerForm = ({
  open,
  setOpen,
  toner = null,
  onSuccess,
}: UpsertTonerFormProps) => {
  const [localidades, setLocalidades] = useState<{ nome: string }[]>([]);
  const [impressoras, setImpressoras] = useState<{ nome: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: toner?.nome || "",
      cor: toner?.cor || undefined,
      localidadeNome: toner?.localidadeNome || undefined,
      impressoraNome: toner?.impressoraNome || undefined,
      estoqueMin: toner?.estoqueMin || 0,
      estoqueAtual: toner?.estoqueAtual || 0,
    },
  });

  useEffect(() => {
    if (open) {
      getLocalidades().then(setLocalidades);
      getImpressoras().then(setImpressoras);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset();
    } else if (toner) {
      form.reset({
        nome: toner.nome,
        cor: toner.cor || undefined,
        localidadeNome: toner.localidadeNome || undefined,
        impressoraNome: toner.impressoraNome || undefined,
        estoqueMin: toner.estoqueMin || 0,
        estoqueAtual: toner.estoqueAtual || 0,
      });
    }
  }, [open, form, toner]);

  const upsertTonerAction = useAction(upsertToner, {
    onSuccess: (result) => {
      toast.success(
        result.data?.message || "Toner cadastrado com sucesso!",
      );
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro ao cadastrar toner:", error);
      const errorMessage =
        error?.error?.serverError || "Erro ao cadastrar toner";
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      ...(toner ? { id: toner.id } : {}),
    };
    upsertTonerAction.execute(payload);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {toner ? "Editar Toner" : "Novo Toner"}
        </DialogTitle>
        <DialogDescription>
          {toner
            ? "Atualize as informações do toner"
            : "Preencha o formulário abaixo para cadastrar um novo toner"}
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
                  <Input placeholder="Nome do toner" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value || undefined);
                  }}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cor (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Preta">Preta</SelectItem>
                    <SelectItem value="Amarela">Amarela</SelectItem>
                    <SelectItem value="Magenta">Magenta</SelectItem>
                    <SelectItem value="Azul">Azul</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="impressoraNome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impressora</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value || undefined);
                  }}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma impressora (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {impressoras.map((impressora) => (
                      <SelectItem key={impressora.nome} value={impressora.nome}>
                        {impressora.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="localidadeNome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localidade</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value || undefined);
                  }}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma localidade (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {localidades.map((localidade) => (
                      <SelectItem key={localidade.nome} value={localidade.nome}>
                        {localidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="estoqueMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque Mínimo</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Estoque mínimo"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estoqueAtual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque Atual</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Estoque atual"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
              disabled={upsertTonerAction.status === "executing"}
            >
              {upsertTonerAction.status === "executing"
                ? "Salvando..."
                : toner
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertTonerForm;

