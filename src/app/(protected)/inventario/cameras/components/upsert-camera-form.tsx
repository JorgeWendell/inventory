"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertCamera } from "@/actions/upsert-camera";
import { getLocalidades } from "@/actions/get-localidades";
import { getUsuarios } from "@/actions/get-usuarios";
import { getNobreaks } from "@/actions/get-nobreaks";
import { getCameraUsuarios } from "@/actions/get-camera-usuarios";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { camerasTable } from "@/db/schema";

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  localidade: z.string().optional(),
  quantidadeCameras: z.number().int().min(1),
  intelbrasId: z.string().optional(),
  nobreakId: z.string().optional(),
  usuariosNome: z.array(z.string()),
});

interface UpsertCameraFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  camera?: typeof camerasTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertCameraForm = ({
  open,
  setOpen,
  camera = null,
  onSuccess,
}: UpsertCameraFormProps) => {
  const [localidades, setLocalidades] = useState<{ nome: string }[]>([]);
  const [usuarios, setUsuarios] = useState<{ nome: string }[]>([]);
  const [nobreaks, setNobreaks] = useState<
    { id: string; marca: string | null; modelo: string | null }[]
  >([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: camera?.nome || "",
      localidade: camera?.localidade || undefined,
      quantidadeCameras: camera?.quantidadeCameras || 1,
      intelbrasId: camera?.intelbrasId || "",
      nobreakId: camera?.nobreakId || undefined,
      usuariosNome: [],
    },
  });

  useEffect(() => {
    if (open) {
      getLocalidades().then(setLocalidades);
      getUsuarios().then(setUsuarios);
      getNobreaks().then(setNobreaks);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset();
    } else if (camera) {
      setLoadingUsuarios(true);
      getCameraUsuarios(camera.id)
        .then((usuariosNome) => {
          form.reset({
            nome: camera.nome,
            localidade: camera.localidade || undefined,
            quantidadeCameras: camera.quantidadeCameras || 1,
            intelbrasId: camera.intelbrasId || "",
            nobreakId: camera.nobreakId || undefined,
            usuariosNome,
          });
        })
        .finally(() => {
          setLoadingUsuarios(false);
        });
    }
  }, [open, form, camera]);

  const upsertCameraAction = useAction(upsertCamera, {
    onSuccess: (result) => {
      toast.success(
        result.data?.message || "Câmera cadastrada com sucesso!",
      );
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro ao cadastrar câmera:", error);
      const errorMessage =
        error?.error?.serverError || "Erro ao cadastrar câmera";
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      ...(camera ? { id: camera.id } : {}),
    };
    upsertCameraAction.execute(payload);
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {camera ? "Editar Câmera" : "Nova Câmera"}
        </DialogTitle>
        <DialogDescription>
          {camera
            ? "Atualize as informações da câmera"
            : "Preencha o formulário abaixo para cadastrar uma nova câmera"}
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
                  <Input placeholder="Nome da câmera" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="localidade"
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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantidadeCameras"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade de Câmeras</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Quantidade"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="intelbrasId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Intelbras</FormLabel>
                  <FormControl>
                    <Input placeholder="ID Intelbras" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="nobreakId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nobreak</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value || undefined);
                  }}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um nobreak (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {nobreaks.map((nobreak) => (
                      <SelectItem key={nobreak.id} value={nobreak.id}>
                        {nobreak.marca && nobreak.modelo
                          ? `${nobreak.marca} - ${nobreak.modelo}`
                          : nobreak.marca || nobreak.modelo || nobreak.id}
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
            name="usuariosNome"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Usuários com Acesso</FormLabel>
                </div>
                {loadingUsuarios ? (
                  <div className="text-sm text-muted-foreground">
                    Carregando usuários...
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-4">
                    {usuarios.map((usuario) => (
                      <FormField
                        key={usuario.nome}
                        control={form.control}
                        name="usuariosNome"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={usuario.nome}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(usuario.nome)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          usuario.nome,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== usuario.nome,
                                          ) || [],
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {usuario.nome}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
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
              disabled={upsertCameraAction.status === "executing"}
            >
              {upsertCameraAction.status === "executing"
                ? "Salvando..."
                : camera
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertCameraForm;

