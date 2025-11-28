"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertComputador } from "@/actions/upsert-computador";
import { getLocalidades } from "@/actions/get-localidades";
import { getUsuarios } from "@/actions/get-usuarios";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { computadoresTable } from "@/db/schema";

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  processador: z.string().optional(),
  memoria: z.string().optional(),
  disco: z.string().optional(),
  garantia: z.string().optional(),
  manutencao: z.boolean().optional(),
  localidadeNome: z.string().optional(),
  usuarioNome: z.string().optional(),
});

interface UpsertComputadorFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  computador?: typeof computadoresTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertComputadorForm = ({
  open,
  setOpen,
  computador = null,
  onSuccess,
}: UpsertComputadorFormProps) => {
  const [localidades, setLocalidades] = useState<{ nome: string }[]>([]);
  const [usuarios, setUsuarios] = useState<{ nome: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: computador?.nome || "",
      marca: computador?.marca || "",
      modelo: computador?.modelo || "",
      processador: computador?.processador || "",
      memoria: computador?.memoria || "",
      disco: computador?.disco || "",
      garantia: computador?.garantia
        ? new Date(computador.garantia).toISOString().split("T")[0]
        : "",
      manutencao: computador?.manutencao ?? false,
      localidadeNome: computador?.localidadeNome || undefined,
      usuarioNome: computador?.usuarioNome || undefined,
    },
  });

  useEffect(() => {
    if (open) {
      getLocalidades().then(setLocalidades);
      getUsuarios().then(setUsuarios);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset();
    } else if (computador) {
      form.reset({
        nome: computador.nome,
        marca: computador.marca || "",
        modelo: computador.modelo || "",
        processador: computador.processador || "",
        memoria: computador.memoria || "",
        disco: computador.disco || "",
        garantia: computador.garantia
          ? new Date(computador.garantia).toISOString().split("T")[0]
          : "",
        manutencao: computador.manutencao ?? false,
        localidadeNome: computador.localidadeNome || undefined,
        usuarioNome: computador.usuarioNome || undefined,
      });
    }
  }, [open, form, computador]);

  const upsertComputadorAction = useAction(upsertComputador, {
    onSuccess: (result) => {
      toast.success(
        result.data?.message || "Computador cadastrado com sucesso!",
      );
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro ao cadastrar computador:", error);
      const errorMessage =
        error?.error?.serverError || "Erro ao cadastrar computador";
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      ...(computador ? { id: computador.id } : {}),
    };
    upsertComputadorAction.execute(payload);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {computador ? "Editar Computador" : "Novo Computador"}
        </DialogTitle>
        <DialogDescription>
          {computador
            ? "Atualize as informações do computador"
            : "Preencha o formulário abaixo para cadastrar um novo computador"}
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
                  <Input placeholder="Nome do computador" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="marca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl>
                    <Input placeholder="Marca" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Modelo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="processador"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Processador</FormLabel>
                <FormControl>
                  <Input placeholder="Processador" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="memoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Memória</FormLabel>
                  <FormControl>
                    <Input placeholder="Memória RAM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="disco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disco</FormLabel>
                  <FormControl>
                    <Input placeholder="Armazenamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="garantia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Garantia</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="manutencao"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Em Manutenção</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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
          <FormField
            control={form.control}
            name="usuarioNome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuário</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value || undefined);
                  }}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.nome} value={usuario.nome}>
                        {usuario.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              disabled={upsertComputadorAction.status === "executing"}
            >
              {upsertComputadorAction.status === "executing"
                ? "Salvando..."
                : computador
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertComputadorForm;

