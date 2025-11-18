"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { X } from "lucide-react";

import { upsertImpressora } from "@/actions/upsert-impressora";
import { getLocalidades } from "@/actions/get-localidades";
import { getToners } from "@/actions/get-toners";
import { getImpressoraToners } from "@/actions/get-impressora-toners";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { impressoraTable } from "@/db/schema";

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  localidadeNome: z.string().optional(),
  manutencao: z.boolean(),
  toners: z.array(
    z.object({
      tonerNome: z.string(),
      quantidade: z.number().int().min(1),
    }),
  ),
});

interface UpsertImpressoraFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  impressora?: typeof impressoraTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertImpressoraForm = ({
  open,
  setOpen,
  impressora = null,
  onSuccess,
}: UpsertImpressoraFormProps) => {
  const [localidades, setLocalidades] = useState<{ nome: string }[]>([]);
  const [toners, setToners] = useState<{ nome: string }[]>([]);
  const [loadingToners, setLoadingToners] = useState(false);
  const [selectedToner, setSelectedToner] = useState<string>("");
  const [currentToners, setCurrentToners] = useState<
    { tonerNome: string; quantidade: number }[]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      marca: "",
      modelo: "",
      localidadeNome: undefined,
      manutencao: false,
      toners: [],
    },
  });

  useEffect(() => {
    if (open) {
      getLocalidades().then(setLocalidades);
      getToners().then(setToners);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset({
        nome: "",
        marca: "",
        modelo: "",
        localidadeNome: undefined,
        manutencao: false,
        toners: [],
      });
      setSelectedToner("");
      setCurrentToners([]);
    } else if (impressora) {
      setLoadingToners(true);
      getImpressoraToners(impressora.id)
        .then((impressoraToners) => {
          const tonersData = impressoraToners.map((t) => ({
            tonerNome: t.tonerNome,
            quantidade: t.quantidade || 1,
          }));
          setCurrentToners(tonersData);
          form.reset({
            nome: impressora.nome,
            marca: impressora.marca || "",
            modelo: impressora.modelo || "",
            localidadeNome: impressora.localidadeNome || undefined,
            manutencao: impressora.manutencao || false,
            toners: tonersData,
          });
        })
        .finally(() => {
          setLoadingToners(false);
        });
    } else {
      form.reset({
        nome: "",
        marca: "",
        modelo: "",
        localidadeNome: undefined,
        manutencao: false,
        toners: [],
      });
      setCurrentToners([]);
    }
  }, [open, form, impressora]);

  const upsertImpressoraAction = useAction(upsertImpressora, {
    onSuccess: (result) => {
      toast.success(
        result.data?.message || "Impressora cadastrada com sucesso!",
      );
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro ao cadastrar impressora:", error);
      const errorMessage =
        error?.error?.serverError || "Erro ao cadastrar impressora";
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      ...(impressora ? { id: impressora.id } : {}),
    };
    upsertImpressoraAction.execute(payload);
  }

  const addToner = () => {
    if (!selectedToner) return;

    const tonerExists = currentToners.some(
      (t) => t.tonerNome === selectedToner,
    );

    if (tonerExists) {
      toast.error("Este toner já foi adicionado");
      return;
    }

    const newToners = [
      ...currentToners,
      { tonerNome: selectedToner, quantidade: 1 },
    ];
    setCurrentToners(newToners);
    form.setValue("toners", newToners);
    setSelectedToner("");
  };

  const removeToner = (tonerNome: string) => {
    const newToners = currentToners.filter((t) => t.tonerNome !== tonerNome);
    setCurrentToners(newToners);
    form.setValue("toners", newToners);
  };

  const updateTonerQuantidade = (tonerNome: string, quantidade: number) => {
    const newToners = currentToners.map((t) =>
      t.tonerNome === tonerNome ? { ...t, quantidade } : t,
    );
    setCurrentToners(newToners);
    form.setValue("toners", newToners);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {impressora ? "Editar Impressora" : "Nova Impressora"}
        </DialogTitle>
        <DialogDescription>
          {impressora
            ? "Atualize as informações da impressora"
            : "Preencha o formulário abaixo para cadastrar uma nova impressora"}
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
                  <Input placeholder="Nome da impressora" {...field} />
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
            name="toners"
            render={() => (
              <FormItem>
                <FormLabel>Toners</FormLabel>
                <div className="flex gap-2">
                  <Select value={selectedToner} onValueChange={setSelectedToner}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um toner" />
                    </SelectTrigger>
                    <SelectContent>
                      {toners.map((toner) => {
                        const isSelected = currentToners.some(
                          (t) => t.tonerNome === toner.nome,
                        );
                        return (
                          <SelectItem
                            key={toner.nome}
                            value={toner.nome}
                            disabled={isSelected}
                          >
                            {toner.nome}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addToner} disabled={!selectedToner}>
                    Adicionar
                  </Button>
                </div>
                {currentToners.length > 0 && (
                  <div className="space-y-2 rounded-md border p-3">
                    {currentToners.map((toner) => (
                      <div
                        key={toner.tonerNome}
                        className="flex items-center gap-2 rounded-md border p-2"
                      >
                        <span className="flex-1 text-sm">{toner.tonerNome}</span>
                        <Input
                          type="number"
                          min="1"
                          value={toner.quantidade}
                          onChange={(e) =>
                            updateTonerQuantidade(
                              toner.tonerNome,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeToner(toner.tonerNome)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
              disabled={upsertImpressoraAction.status === "executing"}
            >
              {upsertImpressoraAction.status === "executing"
                ? "Salvando..."
                : impressora
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertImpressoraForm;

