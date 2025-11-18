"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertMonitor } from "@/actions/upsert-monitor";
import { getUsuarios } from "@/actions/get-usuarios";
import { getLocalidades } from "@/actions/get-localidades";
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
import { monitorTable } from "@/db/schema";

const formSchema = z.object({
  marca: z.string().optional(),
  modelo: z.string().optional(),
  localidadeNome: z.string().optional(),
  usuarioNome: z.string().optional(),
});

interface UpsertMonitorFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  monitor?: typeof monitorTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertMonitorForm = ({
  open,
  setOpen,
  monitor = null,
  onSuccess,
}: UpsertMonitorFormProps) => {
  const [usuarios, setUsuarios] = useState<{ nome: string }[]>([]);
  const [localidades, setLocalidades] = useState<{ nome: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marca: monitor?.marca || "",
      modelo: monitor?.modelo || "",
      localidadeNome: monitor?.localidadeNome || undefined,
      usuarioNome: monitor?.usuarioNome || undefined,
    },
  });

  useEffect(() => {
    if (open) {
      getUsuarios().then(setUsuarios);
      getLocalidades().then(setLocalidades);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset();
    } else if (monitor) {
      form.reset({
        marca: monitor.marca || "",
        modelo: monitor.modelo || "",
        localidadeNome: monitor.localidadeNome || undefined,
        usuarioNome: monitor.usuarioNome || undefined,
      });
    }
  }, [open, form, monitor]);

  const upsertMonitorAction = useAction(upsertMonitor, {
    onSuccess: (result) => {
      toast.success(
        result.data?.message || "Monitor cadastrado com sucesso!",
      );
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro ao cadastrar monitor:", error);
      const errorMessage =
        error?.error?.serverError || "Erro ao cadastrar monitor";
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      ...(monitor ? { id: monitor.id } : {}),
    };
    upsertMonitorAction.execute(payload);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {monitor ? "Editar Monitor" : "Novo Monitor"}
        </DialogTitle>
        <DialogDescription>
          {monitor
            ? "Atualize as informações do monitor"
            : "Preencha o formulário abaixo para cadastrar um novo monitor"}
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
              disabled={upsertMonitorAction.status === "executing"}
            >
              {upsertMonitorAction.status === "executing"
                ? "Salvando..."
                : monitor
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertMonitorForm;

