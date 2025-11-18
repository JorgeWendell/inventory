"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { ProtectedRoute } from "@/components/permissions/protected-route";
import { PermissionGate } from "@/components/permissions/permission-gate";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import CreatePedidoInternoForm from "./components/create-pedido-interno-form";
import PedidosInternosTable from "./components/pedidos-internos-table";

const PedidoInternoPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <ProtectedRoute route="/solicitacoes/pedido-interno">
      <PageContainer>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Pedido Interno</PageTitle>
              <PageDescription>
                Faça pedidos internos de materiais de TI e toners.
              </PageDescription>
            </PageHeaderContent>
            <PermissionGate permission="pedidos.create">
              <PageActions>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Novo Pedido
                  </Button>
                </DialogTrigger>
              </PageActions>
            </PermissionGate>
          </PageHeader>
          <PageContent>
            <PedidosInternosTable refreshKey={refreshKey} />
          </PageContent>
          <PermissionGate permission="pedidos.create">
            <CreatePedidoInternoForm
              open={isDialogOpen}
              setOpen={setIsDialogOpen}
              onSuccess={() => setRefreshKey((prev) => prev + 1)}
            />
          </PermissionGate>
        </Dialog>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default PedidoInternoPage;
