"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertUsuario } from "@/actions/upsert-usuario";
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
import { usuarioTable } from "@/db/schema";

const formSchema = z.object({
  login: z.string().min(1, { message: "Login é obrigatório" }),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  cargo: z.string().optional(),
  depto: z.string().optional(),
  localidadeNome: z.string().optional(),
});

interface UpsertUsuarioFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  usuario?: typeof usuarioTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertUsuarioForm = ({
  open,
  setOpen,
  usuario = null,
  onSuccess,
}: UpsertUsuarioFormProps) => {
  const [localidades, setLocalidades] = useState<{ nome: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: usuario?.login || "",
      nome: usuario?.nome || "",
      cargo: usuario?.cargo || "",
      depto: usuario?.depto || "",
      localidadeNome: usuario?.localidadeNome || undefined,
    },
  });

  useEffect(() => {
    if (open) {
      getLocalidades().then(setLocalidades);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset();
    } else if (usuario) {
      form.reset({
        login: usuario.login,
        nome: usuario.nome,
        cargo: usuario.cargo || "",
        depto: usuario.depto || "",
        localidadeNome: usuario.localidadeNome || undefined,
      });
    }
  }, [open, form, usuario]);

  const upsertUsuarioAction = useAction(upsertUsuario, {
    onSuccess: (result) => {
      toast.success(
        result.data?.message || "Usuário cadastrado com sucesso!",
      );
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro ao cadastrar usuário:", error);
      const errorMessage =
        error?.error?.serverError || "Erro ao cadastrar usuário";
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      ...(usuario ? { id: usuario.id } : {}),
    };
    upsertUsuarioAction.execute(payload);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {usuario ? "Editar Usuário" : "Novo Usuário"}
        </DialogTitle>
        <DialogDescription>
          {usuario
            ? "Atualize as informações do usuário"
            : "Preencha o formulário abaixo para cadastrar um novo usuário"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Login</FormLabel>
                <FormControl>
                  <Input placeholder="Login do usuário" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cargo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="Cargo do usuário" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="depto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <FormControl>
                  <Input placeholder="Departamento" {...field} />
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
              disabled={upsertUsuarioAction.status === "executing"}
            >
              {upsertUsuarioAction.status === "executing"
                ? "Salvando..."
                : usuario
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertUsuarioForm;

