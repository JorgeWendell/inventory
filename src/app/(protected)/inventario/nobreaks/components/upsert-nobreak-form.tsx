"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertNobreak } from "@/actions/upsert-nobreak";
import { getLocalidades } from "@/actions/get-localidades";
import { getUsuarios } from "@/actions/get-usuarios";
import { getComputadores } from "@/actions/get-computadores";
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
import { nobreakTable } from "@/db/schema";

const formSchema = z.object({
  marca: z.string().optional(),
  modelo: z.string().optional(),
  capacidade: z.string().optional(),
  localidadeNome: z.string().optional(),
  usuarioNome: z.string().optional(),
  computadoresNome: z.string().optional(),
});

interface UpsertNobreakFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  nobreak?: typeof nobreakTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertNobreakForm = ({
  open,
  setOpen,
  nobreak = null,
  onSuccess,
}: UpsertNobreakFormProps) => {
  const [localidades, setLocalidades] = useState<{ nome: string }[]>([]);
  const [usuarios, setUsuarios] = useState<{ nome: string }[]>([]);
  const [computadores, setComputadores] = useState<{ nome: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marca: nobreak?.marca || "",
      modelo: nobreak?.modelo || "",
      capacidade: nobreak?.capacidade || "",
      localidadeNome: nobreak?.localidadeNome || undefined,
      usuarioNome: nobreak?.usuarioNome || undefined,
      computadoresNome: nobreak?.computadoresNome || undefined,
    },
  });

  useEffect(() => {
    if (open) {
      getLocalidades().then(setLocalidades);
      getUsuarios().then(setUsuarios);
      getComputadores().then(setComputadores);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset();
    } else if (nobreak) {
      form.reset({
        marca: nobreak.marca || "",
        modelo: nobreak.modelo || "",
        capacidade: nobreak.capacidade || "",
        localidadeNome: nobreak.localidadeNome || undefined,
        usuarioNome: nobreak.usuarioNome || undefined,
        computadoresNome: nobreak.computadoresNome || undefined,
      });
    }
  }, [open, form, nobreak]);

  const upsertNobreakAction = useAction(upsertNobreak, {
    onSuccess: (result) => {
      toast.success(
        result.data?.message || "Nobreak cadastrado com sucesso!",
      );
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro ao cadastrar nobreak:", error);
      const errorMessage =
        error?.error?.serverError || "Erro ao cadastrar nobreak";
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      ...(nobreak ? { id: nobreak.id } : {}),
    };
    upsertNobreakAction.execute(payload);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {nobreak ? "Editar Nobreak" : "Novo Nobreak"}
        </DialogTitle>
        <DialogDescription>
          {nobreak
            ? "Atualize as informações do nobreak"
            : "Preencha o formulário abaixo para cadastrar um novo nobreak"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            name="capacidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidade</FormLabel>
                <FormControl>
                  <Input placeholder="Capacidade" {...field} />
                </FormControl>
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
          <FormField
            control={form.control}
            name="computadoresNome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Computador</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value || undefined);
                  }}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um computador (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {computadores.map((computador) => (
                      <SelectItem key={computador.nome} value={computador.nome}>
                        {computador.nome}
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
              disabled={upsertNobreakAction.status === "executing"}
            >
              {upsertNobreakAction.status === "executing"
                ? "Salvando..."
                : nobreak
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertNobreakForm;

