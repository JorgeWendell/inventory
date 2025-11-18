"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertAcessoDepartamento } from "@/actions/upsert-acesso-departamento";
import { getUsuariosLogin } from "@/actions/get-usuarios-login";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { acessosDepartamentosTable } from "@/db/schema";

const departamentosEnum = [
  "Administracao",
  "Compras",
  "Contabil-Fiscal",
  "Dep.Pessoal",
  "Digitação",
  "Financeiro",
  "HD Externo",
  "Juridico",
  "Lista Operacional",
  "Notas Fiscais",
  "Operacional",
  "Porto Marina Resort",
  "TI",
  "Publico",
] as const;

const formSchema = z.object({
  usuarioLogin: z.string().min(1, { message: "Usuário é obrigatório" }),
  computadorNome: z.string().min(1, { message: "Computador é obrigatório" }),
  pastaDepartamentos: z.enum(departamentosEnum),
  usuariosNome: z.array(z.string()),
});

interface UpsertAcessoDepartamentoFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  acessoDepartamento?: typeof acessosDepartamentosTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertAcessoDepartamentoForm = ({
  open,
  setOpen,
  acessoDepartamento = null,
  onSuccess,
}: UpsertAcessoDepartamentoFormProps) => {
  const [usuariosLogin, setUsuariosLogin] = useState<
    { login: string; nome: string }[]
  >([]);
  const [computadores, setComputadores] = useState<{ nome: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usuarioLogin: "",
      computadorNome: "",
      pastaDepartamentos: "Administracao",
      usuariosNome: [],
    },
  });

  useEffect(() => {
    if (open) {
      getUsuariosLogin().then(setUsuariosLogin);
      getComputadores().then(setComputadores);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset({
        usuarioLogin: "",
        computadorNome: "",
        pastaDepartamentos: "Administracao",
        usuariosNome: [],
      });
    } else if (acessoDepartamento) {
      form.reset({
        usuarioLogin: acessoDepartamento.usuarioLogin,
        computadorNome: acessoDepartamento.computadorNome,
        pastaDepartamentos: acessoDepartamento.pastaDepartamentos,
        usuariosNome: [],
      });
    } else {
      form.reset({
        usuarioLogin: "",
        computadorNome: "",
        pastaDepartamentos: "Administracao",
        usuariosNome: [],
      });
    }
  }, [open, form, acessoDepartamento]);

  const upsertAcessoDepartamentoAction = useAction(upsertAcessoDepartamento, {
    onSuccess: (result) => {
      toast.success(result.data?.message || "Acesso cadastrado com sucesso!");
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro ao cadastrar acesso:", error);
      const errorMessage =
        error?.error?.serverError || "Erro ao cadastrar acesso";
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      usuariosNome: [],
      ...(acessoDepartamento ? { id: acessoDepartamento.id } : {}),
    };
    upsertAcessoDepartamentoAction.execute(payload);
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {acessoDepartamento
            ? "Editar Acesso e Departamento"
            : "Novo Acesso e Departamento"}
        </DialogTitle>
        <DialogDescription>
          {acessoDepartamento
            ? "Atualize as informações do acesso"
            : "Preencha o formulário abaixo para cadastrar um novo acesso"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="usuarioLogin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuário</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {usuariosLogin.map((usuario) => (
                      <SelectItem key={usuario.login} value={usuario.login}>
                        {usuario.login}
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
            name="computadorNome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Computador</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
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
            name="pastaDepartamentos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pasta Departamentos</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value as (typeof departamentosEnum)[number]);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departamentosEnum.map((depto) => (
                      <SelectItem key={depto} value={depto}>
                        {depto}
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
              disabled={upsertAcessoDepartamentoAction.status === "executing"}
            >
              {upsertAcessoDepartamentoAction.status === "executing"
                ? "Salvando..."
                : acessoDepartamento
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertAcessoDepartamentoForm;
