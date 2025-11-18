"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getLocalidades } from "@/actions/get-localidades";
import { upsertMaterialTi } from "@/actions/upsert-material-ti";
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
import { materiaisDeTiTable } from "@/db/schema";
import { materiaisCategorias } from "@/constants/materiais-de-ti";

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  categoria: z.enum(materiaisCategorias, {
    errorMap: () => ({ message: "Selecione uma categoria" }),
  }),
  estoqueMin: z.coerce
    .number()
    .int()
    .min(0, { message: "Estoque mínimo deve ser maior ou igual a zero" }),
  estoqueAtual: z.coerce
    .number()
    .int()
    .min(0, { message: "Estoque atual deve ser maior ou igual a zero" }),
  localidadeNome: z.string().optional().nullable(),
});

const semLocalidadeValue = "__sem_localidade__";

interface UpsertMaterialFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  material?: typeof materiaisDeTiTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertMaterialForm = ({
  open,
  setOpen,
  material = null,
  onSuccess,
}: UpsertMaterialFormProps) => {
  const [localidades, setLocalidades] = useState<{ nome: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      categoria: "Mouse",
      estoqueMin: 0,
      estoqueAtual: 0,
      localidadeNome: semLocalidadeValue,
    },
  });

  useEffect(() => {
    if (open) {
      getLocalidades().then(setLocalidades);
    }
  }, [open]);

  useEffect(() => {
    if (material && open) {
      form.reset({
        nome: material.nome,
        categoria: (material.categoria ??
          "Mouse") as (typeof materiaisCategorias)[number],
        estoqueMin: material.estoqueMin ?? 0,
        estoqueAtual: material.estoqueAtual ?? 0,
        localidadeNome: material.localidadeNome || semLocalidadeValue,
      });
    } else if (!material && open) {
      form.reset({
        nome: "",
        categoria: "Mouse",
        estoqueMin: 0,
        estoqueAtual: 0,
        localidadeNome: semLocalidadeValue,
      });
    }
  }, [material, open, form]);

  const upsertMaterialAction = useAction(upsertMaterialTi, {
    onSuccess: (result) => {
      toast.success(result.data?.message ?? "Material salvo com sucesso!");
      form.reset({
        nome: "",
        categoria: "Mouse",
        estoqueMin: 0,
        estoqueAtual: 0,
        localidadeNome: semLocalidadeValue,
      });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      const message = error.error?.serverError ?? "Erro ao salvar material";
      toast.error(message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertMaterialAction.execute({
      ...values,
      localidadeNome:
        values.localidadeNome === semLocalidadeValue
          ? null
          : values.localidadeNome,
      ...(material ? { id: material.id } : {}),
    });
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {material ? "Editar Material de TI" : "Novo Material de TI"}
        </DialogTitle>
        <DialogDescription>
          {material
            ? "Atualize os dados do material selecionado."
            : "Preencha os dados para cadastrar um novo material."}
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
                  <Input placeholder="Ex: Mouse Logitech" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(
                      value as (typeof materiaisCategorias)[number],
                    )
                  }
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {materiaisCategorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="estoqueMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque mínimo</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
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
                  <FormLabel>Estoque atual</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="localidadeNome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localidade</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value || semLocalidadeValue}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a localidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={semLocalidadeValue}>
                      Sem localidade
                    </SelectItem>
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
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={upsertMaterialAction.status === "executing"}
            >
              {upsertMaterialAction.status === "executing"
                ? "Salvando..."
                : material
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertMaterialForm;


