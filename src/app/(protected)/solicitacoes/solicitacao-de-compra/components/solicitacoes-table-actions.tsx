"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { completeSolicitacaoCompra } from "@/actions/complete-solicitacao-compra";
import { createSolicitacaoCompraCotacao } from "@/actions/create-solicitacao-compra-cotacao";
import { getSolicitacaoCompraCotacoes } from "@/actions/get-solicitacao-compra-cotacoes";
import { markSolicitacaoCompraComprado } from "@/actions/mark-solicitacao-compra-comprado";
import { updateSolicitacaoCompraStatus } from "@/actions/update-solicitacao-compra-status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { solicitacaoCompraStatusLabel } from "@/constants/solicitacao-compra";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SolicitacaoCompraTableData } from "./solicitacoes-table";

interface SolicitacoesTableActionsProps {
  solicitacao: SolicitacaoCompraTableData;
  onUpdated: () => void;
}

// Função para formatar data considerando GMT-3
const formatDateBR = (dateString: string | null): string => {
  if (!dateString) return "-";
  
  // Se já está no formato YYYY-MM-DD, converter diretamente
  if (typeof dateString === "string" && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }
  
  // Se for uma data ISO, criar considerando timezone local
  const date = new Date(dateString);
  // Ajustar para GMT-3 (Brasil)
  const offset = -3 * 60; // GMT-3 em minutos
  const localDate = new Date(date.getTime() + (offset - date.getTimezoneOffset()) * 60000);
  
  return localDate.toLocaleDateString("pt-BR");
};

const cotacoesFormSchema = z.object({
  fornecedorNome: z.string().min(1, { message: "Fornecedor é obrigatório" }),
  fornecedorCnpj: z.string().optional().nullable(),
  produtoDescricao: z.string().min(1, { message: "Produto é obrigatório" }),
  valor: z.number().min(0.01, { message: "Informe o valor" }),
  quantidade: z
    .number()
    .int()
    .min(1, { message: "Quantidade deve ser maior que zero" }),
  prazoEntrega: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

const conclusaoFormSchema = z.object({
  recebidoPor: z.string().min(1, { message: "Informe quem recebeu" }),
  dataRecebimento: z.string().min(1, { message: "Informe a data de recebimento" }),
  numeroNotaFiscal: z.string().optional().nullable(),
});

const SolicitacoesTableActions = ({
  solicitacao,
  onUpdated,
}: SolicitacoesTableActionsProps) => {
  const [isCotacoesDialogOpen, setIsCotacoesDialogOpen] = useState(false);
  const [isSelecionarFornecedorOpen, setIsSelecionarFornecedorOpen] =
    useState(false);
  const [isConclusaoDialogOpen, setIsConclusaoDialogOpen] = useState(false);
  const [cotacoes, setCotacoes] = useState<
    {
      id: string;
      fornecedorNome: string;
      fornecedorCnpj: string | null;
      produtoDescricao: string;
      valor: number;
      quantidade: number;
      prazoEntrega: string | null;
      editadoPor: string;
    }[]
  >([]);
  const [cotacoesLoading, setCotacoesLoading] = useState(false);
  const [statusValue, setStatusValue] = useState<SolicitacaoCompraTableData["status"]>(
    solicitacao.status,
  );
  const [selectedFornecedorId, setSelectedFornecedorId] = useState<string | null>(
    solicitacao.cotacaoSelecionada?.id ?? null,
  );

  const updateStatusAction = useAction(updateSolicitacaoCompraStatus, {
    onSuccess: (result) => {
      toast.success(result.data?.message ?? "Status atualizado");
      onUpdated();
    },
    onError: (error) => {
      const message =
        error.error?.serverError ?? "Erro ao atualizar o status";
      toast.error(message);
    },
  });

  const markCompradoAction = useAction(markSolicitacaoCompraComprado, {
    onSuccess: (result) => {
      toast.success(result.data?.message ?? "Solicitação atualizada");
      setIsSelecionarFornecedorOpen(false);
      onUpdated();
    },
    onError: (error) => {
      const message =
        error.error?.serverError ?? "Erro ao marcar como comprado";
      toast.error(message);
    },
  });

  const createCotacaoAction = useAction(createSolicitacaoCompraCotacao, {
    onSuccess: (result) => {
      toast.success(result.data?.message ?? "Cotação cadastrada");
      loadCotacoes();
      cotacoesForm.reset({
        fornecedorNome: "",
        fornecedorCnpj: "",
        produtoDescricao: solicitacao.material.nome,
        valor: 0,
        quantidade: solicitacao.quantidade,
        prazoEntrega: "",
      });
      onUpdated();
    },
    onError: (error) => {
      const message =
        error.error?.serverError ?? "Erro ao cadastrar cotação";
      toast.error(message);
    },
  });

  const completeSolicitacaoAction = useAction(completeSolicitacaoCompra, {
    onSuccess: (result) => {
      toast.success(result.data?.message ?? "Recebimento registrado");
      setIsConclusaoDialogOpen(false);
      onUpdated();
    },
    onError: (error) => {
      const message =
        error.error?.serverError ?? "Erro ao concluir solicitação";
      toast.error(message);
    },
  });

  const cotacoesForm = useForm<z.infer<typeof cotacoesFormSchema>>({
    resolver: zodResolver(cotacoesFormSchema),
    defaultValues: {
      fornecedorNome: "",
      fornecedorCnpj: "",
      produtoDescricao: solicitacao.material.nome,
      valor: 0,
      quantidade: solicitacao.quantidade,
      prazoEntrega: "",
      observacoes: "",
    },
  });

  const conclusaoForm = useForm<z.infer<typeof conclusaoFormSchema>>({
    resolver: zodResolver(conclusaoFormSchema),
    defaultValues: {
      recebidoPor: solicitacao.recebidoPor ?? "",
      dataRecebimento:
        solicitacao.dataRecebimento?.slice(0, 10) ??
        new Date().toISOString().slice(0, 10),
      numeroNotaFiscal: solicitacao.numeroNotaFiscal ?? "",
    },
  });

  const loadCotacoes = () => {
    setCotacoesLoading(true);
    return getSolicitacaoCompraCotacoes(solicitacao.id)
      .then((data) => {
        setCotacoes(data);
        return data;
      })
      .finally(() => setCotacoesLoading(false));
  };

  useEffect(() => {
    if (isCotacoesDialogOpen) {
      loadCotacoes();
      cotacoesForm.reset({
        fornecedorNome: "",
        fornecedorCnpj: "",
        produtoDescricao: solicitacao.material.nome,
        valor: 0,
        quantidade: solicitacao.quantidade,
        prazoEntrega: "",
      });
    }
  }, [isCotacoesDialogOpen, solicitacao, cotacoesForm]);

  useEffect(() => {
    setStatusValue(solicitacao.status);
    setSelectedFornecedorId(solicitacao.cotacaoSelecionada?.id ?? null);
    conclusaoForm.reset({
      recebidoPor: solicitacao.recebidoPor ?? "",
      dataRecebimento:
        solicitacao.dataRecebimento?.slice(0, 10) ??
        new Date().toISOString().slice(0, 10),
      numeroNotaFiscal: solicitacao.numeroNotaFiscal ?? "",
    });
  }, [
    solicitacao.status,
    solicitacao.cotacaoSelecionada?.id,
    solicitacao.recebidoPor,
    solicitacao.dataRecebimento,
    solicitacao.numeroNotaFiscal,
    conclusaoForm,
  ]);

  useEffect(() => {
    if (!selectedFornecedorId && cotacoes.length > 0) {
      setSelectedFornecedorId(cotacoes[0].id);
    }
  }, [cotacoes, selectedFornecedorId]);

  const handleStatusChange = async (status: string) => {
    const typedStatus = status as SolicitacaoCompraTableData["status"];
    setStatusValue(typedStatus);

    if (typedStatus === "COMPRADO") {
      const data =
        cotacoes.length === 0 ? await loadCotacoes() : cotacoes;
      if (!data || data.length === 0) {
        toast.error("Cadastre ao menos uma cotação antes de marcar como comprado");
        setStatusValue(solicitacao.status);
        return;
      }
      setSelectedFornecedorId(data[0].id);
      setIsSelecionarFornecedorOpen(true);
      return;
    }

    if (typedStatus === "CONCLUIDO") {
      conclusaoForm.reset({
        recebidoPor: solicitacao.recebidoPor ?? "",
        dataRecebimento:
          solicitacao.dataRecebimento?.slice(0, 10) ??
          new Date().toISOString().slice(0, 10),
        numeroNotaFiscal: solicitacao.numeroNotaFiscal ?? "",
      });
      setIsConclusaoDialogOpen(true);
      return;
    }

    updateStatusAction.execute({
      id: solicitacao.id,
      status: typedStatus,
    });
  };

  const handleCotacoesSubmit = (values: z.infer<typeof cotacoesFormSchema>) => {
    createCotacaoAction.execute({
      solicitacaoCompraId: solicitacao.id,
      fornecedorNome: values.fornecedorNome,
      fornecedorCnpj: values.fornecedorCnpj || "",
      produtoDescricao: values.produtoDescricao,
      valor: values.valor,
      quantidade: values.quantidade,
      prazoEntrega: values.prazoEntrega || "",
    });
  };

  const moedaFormatter = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    [],
  );

  return (
    <>
    <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
      <Select
        value={statusValue}
        onValueChange={handleStatusChange}
        disabled={
          updateStatusAction.status === "executing" ||
          markCompradoAction.status === "executing" ||
          solicitacao.status === "CONCLUIDO"
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(solicitacaoCompraStatusLabel).map(([value, label]) => (
            <SelectItem
              key={value}
              value={value}
              disabled={
                ["AGUARDANDO_ENTREGA", "COMPRADO", "CONCLUIDO"].includes(
                  solicitacao.status,
                ) && value === "EM_ANDAMENTO"
              }
            >
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Dialog
        open={isCotacoesDialogOpen}
        onOpenChange={(open) => {
          if (solicitacao.status === "CONCLUIDO") return;
          setIsCotacoesDialogOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={solicitacao.status === "CONCLUIDO"}>
            <FileText className="mr-1 h-4 w-4" />
            Cotações
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cotações</DialogTitle>
            <DialogDescription>
              Registre e consulte as cotações deste material.
            </DialogDescription>
          </DialogHeader>
          <Form {...cotacoesForm}>
            <form
              onSubmit={cotacoesForm.handleSubmit(handleCotacoesSubmit)}
              className="space-y-4"
            >
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Qtd.</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Editado por</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cotacoesLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Carregando cotações...
                          </TableCell>
                        </TableRow>
                      ) : cotacoes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Nenhuma cotação cadastrada.
                          </TableCell>
                        </TableRow>
                      ) : (
                        cotacoes.map((cotacao) => (
                          <TableRow key={cotacao.id}>
                            <TableCell className="font-medium">
                              {cotacao.fornecedorNome}
                            </TableCell>
                            <TableCell>{cotacao.fornecedorCnpj || "-"}</TableCell>
                            <TableCell>{cotacao.produtoDescricao}</TableCell>
                            <TableCell>
                              {moedaFormatter.format(cotacao.valor)}
                            </TableCell>
                            <TableCell>{cotacao.quantidade}</TableCell>
                            <TableCell>
                              {formatDateBR(cotacao.prazoEntrega)}
                            </TableCell>
                            <TableCell>{cotacao.editadoPor}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <FormField
                control={cotacoesForm.control}
                name="fornecedorNome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do fornecedor</FormLabel>
                    <FormControl>
                      <Input placeholder="Fornecedor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={cotacoesForm.control}
                  name="fornecedorCnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00.000.000/0000-00"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={cotacoesForm.control}
                  name="produtoDescricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      <FormControl>
                        <Input placeholder="Descrição do produto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={cotacoesForm.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (BRL)</FormLabel>
                      <FormControl>
                        <Controller
                          control={cotacoesForm.control}
                          name="valor"
                          render={({ field: controllerField }) => (
                            <NumericFormat
                              value={controllerField.value}
                              thousandSeparator="."
                              decimalSeparator=","
                              prefix="R$ "
                              decimalScale={2}
                              fixedDecimalScale
                              allowNegative={false}
                              customInput={Input}
                              onValueChange={(values) =>
                                controllerField.onChange(values.floatValue ?? 0)
                              }
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={cotacoesForm.control}
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
                <FormField
                  control={cotacoesForm.control}
                  name="prazoEntrega"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo de entrega</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={cotacoesForm.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Informações adicionais para esta cotação"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCotacoesDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createCotacaoAction.status === "executing"}
                >
                  {createCotacaoAction.status === "executing"
                    ? "Salvando..."
                    : "Adicionar cotação"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      </div>
      <Dialog
        open={isSelecionarFornecedorOpen}
        onOpenChange={(open) => {
          setIsSelecionarFornecedorOpen(open);
          if (!open && solicitacao.status !== "COMPRADO") {
            setStatusValue(solicitacao.status);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Selecionar fornecedor</DialogTitle>
            <DialogDescription>
              Escolha o fornecedor onde a compra foi realizada.
            </DialogDescription>
          </DialogHeader>
          <Select
            value={selectedFornecedorId ?? undefined}
            onValueChange={(value) => setSelectedFornecedorId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o fornecedor" />
            </SelectTrigger>
            <SelectContent>
              {cotacoes.map((cotacao) => (
                <SelectItem key={cotacao.id} value={cotacao.id}>
                  {cotacao.fornecedorNome} — {moedaFormatter.format(cotacao.valor)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsSelecionarFornecedorOpen(false);
                setStatusValue(solicitacao.status);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!selectedFornecedorId}
              onClick={() => {
                if (!selectedFornecedorId) return;
                markCompradoAction.execute({
                  id: solicitacao.id,
                  cotacaoId: selectedFornecedorId,
                });
              }}
            >
              {markCompradoAction.status === "executing"
                ? "Salvando..."
                : "Confirmar compra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isConclusaoDialogOpen}
        onOpenChange={(open) => {
          setIsConclusaoDialogOpen(open);
          if (!open && solicitacao.status !== "CONCLUIDO") {
            setStatusValue(solicitacao.status);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar recebimento</DialogTitle>
            <DialogDescription>
              Informe quem recebeu o material e os dados da nota fiscal.
            </DialogDescription>
          </DialogHeader>
          <Form {...conclusaoForm}>
            <form
              onSubmit={conclusaoForm.handleSubmit((values) =>
                completeSolicitacaoAction.execute({
                  id: solicitacao.id,
                  recebidoPor: values.recebidoPor,
                  dataRecebimento: values.dataRecebimento,
                  numeroNotaFiscal: values.numeroNotaFiscal || "",
                }),
              )}
              className="space-y-4"
            >
              <FormField
                control={conclusaoForm.control}
                name="recebidoPor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recebido por</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome de quem recebeu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={conclusaoForm.control}
                name="dataRecebimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de recebimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={conclusaoForm.control}
                name="numeroNotaFiscal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº Nota Fiscal (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o número da nota"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsConclusaoDialogOpen(false);
                    setStatusValue(solicitacao.status);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={completeSolicitacaoAction.status === "executing"}
                >
                  {completeSolicitacaoAction.status === "executing"
                    ? "Salvando..."
                    : "Concluir"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SolicitacoesTableActions;


