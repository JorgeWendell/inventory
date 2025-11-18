"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createPedidoInterno } from "@/actions/create-pedido-interno";
import { getMateriaisDeTi } from "@/actions/get-materiais-de-ti";
import { getToners } from "@/actions/get-toners";
import { getImpressoras } from "@/actions/get-impressoras";
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

const coresEnum = z.enum(["Preta", "Amarela", "Magenta", "Azul"]);

const formSchema = z
  .object({
    tipoProduto: z.enum(["MATERIAL_TI", "TONER"]),
    produtoId: z.string().min(1, { message: "Produto é obrigatório" }),
    quantidade: z.coerce
      .number()
      .int()
      .min(1, { message: "Quantidade deve ser maior que zero" }),
    localidadeNome: z.string().optional().nullable(),
    impressoraNome: z.string().optional().nullable(),
    cor: coresEnum.optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.tipoProduto === "TONER") {
        return !!data.impressoraNome && !!data.cor;
      }
      return true;
    },
    {
      message: "Impressora e cor são obrigatórios para toners",
      path: ["impressoraNome"],
    },
  );

const semLocalidadeValue = "__sem_localidade__";

interface CreatePedidoInternoFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreatePedidoInternoForm = ({
  open,
  setOpen,
  onSuccess,
}: CreatePedidoInternoFormProps) => {
  const [materiais, setMateriais] = useState<{ id: string; nome: string }[]>(
    [],
  );
  const [toners, setToners] = useState<{ id: string; nome: string }[]>([]);
  const [impressoras, setImpressoras] = useState<{ nome: string }[]>([]);
  const [localidades, setLocalidades] = useState<{ nome: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipoProduto: "MATERIAL_TI",
      produtoId: "",
      quantidade: 1,
      localidadeNome: semLocalidadeValue,
      impressoraNome: "",
      cor: undefined,
    },
  });

  const tipoProduto = form.watch("tipoProduto");

  useEffect(() => {
    if (open) {
      getMateriaisDeTi().then(setMateriais);
      getToners().then(setToners);
      getImpressoras().then(setImpressoras);
      getLocalidades().then(setLocalidades);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset({
        tipoProduto: "MATERIAL_TI",
        produtoId: "",
        quantidade: 1,
        localidadeNome: semLocalidadeValue,
        impressoraNome: "",
        cor: undefined,
      });
    }
  }, [open, form]);

  // Reset produtoId quando tipoProduto muda
  useEffect(() => {
    form.setValue("produtoId", "");
    if (tipoProduto === "TONER") {
      form.setValue("impressoraNome", "");
      form.setValue("cor", undefined);
    }
  }, [tipoProduto, form]);

  const createPedidoAction = useAction(createPedidoInterno, {
    onSuccess: (result) => {
      toast.success(result.data?.message ?? "Pedido criado com sucesso");
      form.reset({
        tipoProduto: "MATERIAL_TI",
        produtoId: "",
        quantidade: 1,
        localidadeNome: semLocalidadeValue,
        impressoraNome: "",
        cor: undefined,
      });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      const message = error.error?.serverError ?? "Erro ao criar pedido";
      toast.error(message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const submitData = {
      tipoProduto: values.tipoProduto,
      produtoId: values.produtoId,
      quantidade: values.quantidade,
      localidadeNome:
        values.localidadeNome === semLocalidadeValue
          ? null
          : values.localidadeNome,
      impressoraNome: values.impressoraNome || null,
      cor: values.cor || null,
    };

    createPedidoAction.execute(submitData);
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Novo Pedido Interno</DialogTitle>
        <DialogDescription>
          Escolha o produto e informe os detalhes do pedido.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="tipoProduto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Produto</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value as "MATERIAL_TI" | "TONER")
                  }
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MATERIAL_TI">Material de TI</SelectItem>
                    <SelectItem value="TONER">Toner</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {tipoProduto === "MATERIAL_TI" ? (
            <FormField
              control={form.control}
              name="produtoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o material" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materiais.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
              <FormField
                control={form.control}
                name="produtoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o toner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {toners.map((toner) => (
                          <SelectItem key={toner.id} value={toner.id}>
                            {toner.nome}
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
                name="impressoraNome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impressora</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a impressora" />
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
                name="cor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value as z.infer<typeof coresEnum>)
                      }
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {coresEnum.options.map((cor) => (
                          <SelectItem key={cor} value={cor}>
                            {cor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="quantidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
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
                    field.onChange(value === semLocalidadeValue ? "" : value);
                  }}
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
              disabled={createPedidoAction.status === "executing"}
            >
              {createPedidoAction.status === "executing"
                ? "Salvando..."
                : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default CreatePedidoInternoForm;

