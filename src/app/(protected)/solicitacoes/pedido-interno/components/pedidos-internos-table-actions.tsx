"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updatePedidoInternoStatus } from "@/actions/update-pedido-interno-status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { pedidoInternoStatusLabel } from "@/constants/pedido-interno";

import { PedidoInternoTableData } from "./pedidos-internos-table";

interface PedidosInternosTableActionsProps {
  pedido: PedidoInternoTableData;
  onUpdated: () => void;
}

const envioFormSchema = z.object({
  enviadoPor: z.string().min(1, { message: "Campo obrigatório" }),
  dataEnvio: z.string().min(1, { message: "Campo obrigatório" }),
});

const recebimentoFormSchema = z.object({
  recebidoPor: z.string().min(1, { message: "Campo obrigatório" }),
  dataRecebimento: z.string().min(1, { message: "Campo obrigatório" }),
});

const PedidosInternosTableActions = ({
  pedido,
  onUpdated,
}: PedidosInternosTableActionsProps) => {
  const [statusValue, setStatusValue] = useState<PedidoInternoTableData["status"]>(
    pedido.status,
  );
  const [isEnvioDialogOpen, setIsEnvioDialogOpen] = useState(false);
  const [isRecebimentoDialogOpen, setIsRecebimentoDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<
    PedidoInternoTableData["status"] | null
  >(null);

  const envioForm = useForm<z.infer<typeof envioFormSchema>>({
    resolver: zodResolver(envioFormSchema),
    defaultValues: {
      enviadoPor: "",
      dataEnvio: "",
    },
  });

  const recebimentoForm = useForm<z.infer<typeof recebimentoFormSchema>>({
    resolver: zodResolver(recebimentoFormSchema),
    defaultValues: {
      recebidoPor: "",
      dataRecebimento: "",
    },
  });

  useEffect(() => {
    setStatusValue(pedido.status);
  }, [pedido.status]);

  // Resetar status se dialog for fechado sem salvar
  useEffect(() => {
    if (!isEnvioDialogOpen && !isRecebimentoDialogOpen && pendingStatus) {
      setStatusValue(pedido.status);
      setPendingStatus(null);
    }
  }, [isEnvioDialogOpen, isRecebimentoDialogOpen, pedido.status, pendingStatus]);

  const updateStatusAction = useAction(updatePedidoInternoStatus, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success(data.message);
        onUpdated();
        setIsEnvioDialogOpen(false);
        setIsRecebimentoDialogOpen(false);
        envioForm.reset();
        recebimentoForm.reset();
        setPendingStatus(null);
      }
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError);
      }
    },
  });

  const handleStatusChange = (value: string) => {
    const newStatus = value as PedidoInternoTableData["status"];

    // Se já está no mesmo status, não fazer nada
    if (newStatus === pedido.status) {
      return;
    }

    // Se mudando para ENVIADO, abrir dialog de envio
    if (newStatus === "ENVIADO") {
      setPendingStatus(newStatus);
      setIsEnvioDialogOpen(true);
      return;
    }

    // Se mudando para RECEBIDO, abrir dialog de recebimento
    if (newStatus === "RECEBIDO") {
      setPendingStatus(newStatus);
      setIsRecebimentoDialogOpen(true);
      return;
    }

    // Para outros status, atualizar diretamente
    setStatusValue(newStatus);
    updateStatusAction.execute({
      id: pedido.id,
      status: newStatus,
    });
  };

  const handleEnvioSubmit = (values: z.infer<typeof envioFormSchema>) => {
    if (pendingStatus) {
      updateStatusAction.execute({
        id: pedido.id,
        status: pendingStatus,
        enviadoPor: values.enviadoPor,
        dataEnvio: values.dataEnvio,
      });
      setStatusValue(pendingStatus);
    }
  };

  const handleRecebimentoSubmit = (
    values: z.infer<typeof recebimentoFormSchema>,
  ) => {
    if (pendingStatus) {
      updateStatusAction.execute({
        id: pedido.id,
        status: pendingStatus,
        recebidoPor: values.recebidoPor,
        dataRecebimento: values.dataRecebimento,
      });
      setStatusValue(pendingStatus);
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <Select
          value={statusValue}
          onValueChange={handleStatusChange}
          disabled={
            updateStatusAction.status === "executing" ||
            pedido.status === "RECEBIDO" ||
            !pedido.produtoExiste
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(pedidoInternoStatusLabel).map(([value, label]) => (
              <SelectItem
                key={value}
                value={value}
                disabled={
                  (pedido.status === "ENVIADO" && value === "AGUARDANDO") ||
                  pedido.status === "RECEBIDO"
                }
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dialog de Envio */}
      <Dialog
        open={isEnvioDialogOpen}
        onOpenChange={(open) => {
          setIsEnvioDialogOpen(open);
          if (!open) {
            setPendingStatus(null);
            envioForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Envio</DialogTitle>
            <DialogDescription>
              Informe os dados do envio do pedido.
            </DialogDescription>
          </DialogHeader>
          <Form {...envioForm}>
            <form
              onSubmit={envioForm.handleSubmit(handleEnvioSubmit)}
              className="space-y-4"
            >
              <FormField
                control={envioForm.control}
                name="enviadoPor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enviado por</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome de quem enviou" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={envioForm.control}
                name="dataEnvio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de envio</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const date = e.target.value;
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEnvioDialogOpen(false);
                    setPendingStatus(null);
                    envioForm.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateStatusAction.status === "executing"}
                >
                  {updateStatusAction.status === "executing"
                    ? "Salvando..."
                    : "Confirmar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Recebimento */}
      <Dialog
        open={isRecebimentoDialogOpen}
        onOpenChange={(open) => {
          setIsRecebimentoDialogOpen(open);
          if (!open) {
            setPendingStatus(null);
            recebimentoForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Recebimento</DialogTitle>
            <DialogDescription>
              Informe os dados do recebimento do pedido.
            </DialogDescription>
          </DialogHeader>
          <Form {...recebimentoForm}>
            <form
              onSubmit={recebimentoForm.handleSubmit(handleRecebimentoSubmit)}
              className="space-y-4"
            >
              <FormField
                control={recebimentoForm.control}
                name="recebidoPor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recebido por</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome de quem recebeu" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={recebimentoForm.control}
                name="dataRecebimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de recebimento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const date = e.target.value;
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsRecebimentoDialogOpen(false);
                    setPendingStatus(null);
                    recebimentoForm.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateStatusAction.status === "executing"}
                >
                  {updateStatusAction.status === "executing"
                    ? "Salvando..."
                    : "Confirmar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PedidosInternosTableActions;

