"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createSolicitacaoCompra } from "@/actions/create-solicitacao-compra";
import { getMateriaisDeTi } from "@/actions/get-materiais-de-ti";
import { getToners } from "@/actions/get-toners";
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
    materialId: z.string().uuid().optional(),
    tonerId: z.string().uuid().optional(),
    cor: coresEnum.optional(),
    quantidade: z
      .number()
      .int()
      .min(1, { message: "Quantidade deve ser maior que zero" }),
  })
  .refine(
    (data) => {
      if (data.tipoProduto === "MATERIAL_TI") {
        return !!data.materialId;
      }
      return true;
    },
    {
      message: "Material é obrigatório",
      path: ["materialId"],
    },
  )
  .refine(
    (data) => {
      if (data.tipoProduto === "TONER") {
        return !!data.tonerId && !!data.cor;
      }
      return true;
    },
    {
      message: "Toner e cor são obrigatórios",
      path: ["tonerId"],
    },
  );

interface CreateSolicitacaoFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateSolicitacaoForm = ({
  open,
  setOpen,
  onSuccess,
}: CreateSolicitacaoFormProps) => {
  const [materiais, setMateriais] = useState<{ id: string; nome: string }[]>(
    [],
  );
  const [toners, setToners] = useState<{ id: string; nome: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipoProduto: "MATERIAL_TI",
      materialId: "",
      tonerId: "",
      cor: undefined,
      quantidade: 1,
    },
  });

  const tipoProduto = form.watch("tipoProduto");

  useEffect(() => {
    if (open) {
      getMateriaisDeTi().then(setMateriais);
      getToners().then(setToners);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset({
        tipoProduto: "MATERIAL_TI",
        materialId: "",
        tonerId: "",
        cor: undefined,
        quantidade: 1,
      });
    }
  }, [open, form]);

  // Reset campos quando tipoProduto muda
  useEffect(() => {
    if (tipoProduto === "MATERIAL_TI") {
      form.setValue("tonerId", "");
      form.setValue("cor", undefined);
    } else {
      form.setValue("materialId", "");
    }
  }, [tipoProduto, form]);

  const createSolicitacaoAction = useAction(createSolicitacaoCompra, {
    onSuccess: (result) => {
      toast.success(result.data?.message ?? "Solicitação registrada");
      form.reset({
        tipoProduto: "MATERIAL_TI",
        materialId: "",
        tonerId: "",
        cor: undefined,
        quantidade: 1,
      });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      const message =
        error.error?.serverError ?? "Erro ao criar solicitação";
      toast.error(message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createSolicitacaoAction.execute(values);
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Nova solicitação de compra</DialogTitle>
        <DialogDescription>
          Escolha o material ou toner e informe a quantidade desejada.
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
              name="materialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
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
                name="tonerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
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
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value}
                  />
                </FormControl>
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
              disabled={createSolicitacaoAction.status === "executing"}
            >
              {createSolicitacaoAction.status === "executing"
                ? "Salvando..."
                : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default CreateSolicitacaoForm;


