"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertServidor } from "@/actions/upsert-servidor";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { servidorTable } from "@/db/schema";

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  memoria: z.string().optional(),
  disco1: z.string().optional(),
  disco2: z.string().optional(),
  disco3: z.string().optional(),
  disco4: z.string().optional(),
  disco5: z.string().optional(),
  vm: z.boolean(),
  funcao: z.string().optional(),
});

interface UpsertServidorFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  servidor?: typeof servidorTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertServidorForm = ({
  open,
  setOpen,
  servidor = null,
  onSuccess,
}: UpsertServidorFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      memoria: "",
      disco1: "",
      disco2: "",
      disco3: "",
      disco4: "",
      disco5: "",
      vm: false,
      funcao: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        nome: "",
        memoria: "",
        disco1: "",
        disco2: "",
        disco3: "",
        disco4: "",
        disco5: "",
        vm: false,
        funcao: "",
      });
    } else if (servidor) {
      form.reset({
        nome: servidor.nome,
        memoria: servidor.memoria || "",
        disco1: servidor.disco1 || "",
        disco2: servidor.disco2 || "",
        disco3: servidor.disco3 || "",
        disco4: servidor.disco4 || "",
        disco5: servidor.disco5 || "",
        vm: servidor.vm || false,
        funcao: servidor.funcao || "",
      });
    }
  }, [open, form, servidor]);

  const upsertServidorAction = useAction(upsertServidor, {
    onSuccess: (result) => {
      toast.success(
        result.data?.message || "Servidor cadastrado com sucesso!",
      );
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro ao cadastrar servidor:", error);
      const errorMessage =
        error?.error?.serverError || "Erro ao cadastrar servidor";
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      ...(servidor ? { id: servidor.id } : {}),
    };
    upsertServidorAction.execute(payload);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {servidor ? "Editar Servidor" : "Novo Servidor"}
        </DialogTitle>
        <DialogDescription>
          {servidor
            ? "Atualize as informações do servidor"
            : "Preencha o formulário abaixo para cadastrar um novo servidor"}
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
                  <Input placeholder="Nome do servidor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="memoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memória</FormLabel>
                <FormControl>
                  <Input placeholder="Memória" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="disco1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disco 1</FormLabel>
                  <FormControl>
                    <Input placeholder="Disco 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="disco2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disco 2</FormLabel>
                  <FormControl>
                    <Input placeholder="Disco 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="disco3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disco 3</FormLabel>
                  <FormControl>
                    <Input placeholder="Disco 3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="disco4"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disco 4</FormLabel>
                  <FormControl>
                    <Input placeholder="Disco 4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="disco5"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disco 5</FormLabel>
                  <FormControl>
                    <Input placeholder="Disco 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="funcao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Função</FormLabel>
                <FormControl>
                  <Input placeholder="Função do servidor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vm"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">VM</FormLabel>
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
              disabled={upsertServidorAction.status === "executing"}
            >
              {upsertServidorAction.status === "executing"
                ? "Salvando..."
                : servidor
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertServidorForm;

