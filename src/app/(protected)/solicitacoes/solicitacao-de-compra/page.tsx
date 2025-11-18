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

import CreateSolicitacaoForm from "./components/create-solicitacao-form";
import SolicitacoesTable from "./components/solicitacoes-table";

const SolicitacaoDeCompraPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <ProtectedRoute route="/solicitacoes/solicitacao-de-compra">
      <PageContainer>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Solicitação de Compra</PageTitle>
              <PageDescription>
                Acompanhe o status das compras de materiais de TI.
              </PageDescription>
            </PageHeaderContent>
            <PermissionGate permission="solicitacoes.manage">
              <PageActions>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Nova Solicitação
                  </Button>
                </DialogTrigger>
              </PageActions>
            </PermissionGate>
          </PageHeader>
          <PageContent>
            <SolicitacoesTable refreshKey={refreshKey} />
          </PageContent>
          <PermissionGate permission="solicitacoes.manage">
            <CreateSolicitacaoForm
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

export default SolicitacaoDeCompraPage;
