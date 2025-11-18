"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertOffice } from "@/actions/upsert-office";
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
import { officeTable } from "@/db/schema";

const formSchema = z.object({
  nomeO365: z.string().min(1, { message: "Nome O365 é obrigatório" }),
  senha: z.string().optional(),
  computadorNome: z.string().min(1, { message: "Computador é obrigatório" }),
  usuarioNome: z.string().optional(),
});

interface UpsertOfficeFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  office?: typeof officeTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertOfficeForm = ({
  open,
  setOpen,
  office = null,
  onSuccess,
}: UpsertOfficeFormProps) => {
  const [usuarios, setUsuarios] = useState<{ nome: string }[]>([]);
  const [computadores, setComputadores] = useState<{ nome: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeO365: office?.nomeO365 || "",
      senha: office?.senha || "",
      computadorNome: office?.computadorNome || "",
      usuarioNome: office?.usuarioNome || undefined,
    },
  });

  useEffect(() => {
    if (open) {
      getUsuarios().then(setUsuarios);
      getComputadores().then(setComputadores);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset();
    } else if (office) {
      form.reset({
        nomeO365: office.nomeO365,
        senha: office.senha || "",
        computadorNome: office.computadorNome,
        usuarioNome: office.usuarioNome || undefined,
      });
    }
  }, [open, form, office]);

  const upsertOfficeAction = useAction(upsertOffice, {
    onSuccess: (result) => {
      toast.success(
        result.data?.message || "Office cadastrado com sucesso!",
      );
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro ao cadastrar office:", error);
      const errorMessage =
        error?.error?.serverError || "Erro ao cadastrar office";
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      ...(office ? { id: office.id } : {}),
    };
    upsertOfficeAction.execute(payload);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {office ? "Editar Office" : "Novo Office"}
        </DialogTitle>
        <DialogDescription>
          {office
            ? "Atualize as informações da licença Office"
            : "Preencha o formulário abaixo para cadastrar uma nova licença Office"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nomeO365"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome O365</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do usuário O365" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="senha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Senha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="computadorNome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Computador</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um computador" />
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
              disabled={upsertOfficeAction.status === "executing"}
            >
              {upsertOfficeAction.status === "executing"
                ? "Salvando..."
                : office
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertOfficeForm;

