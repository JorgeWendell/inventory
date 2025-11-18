"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

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
    <PageContainer>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Pedido Interno</PageTitle>
            <PageDescription>
              Faça pedidos internos de materiais de TI e toners.
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Novo Pedido
              </Button>
            </DialogTrigger>
          </PageActions>
        </PageHeader>
        <PageContent>
          <PedidosInternosTable refreshKey={refreshKey} />
        </PageContent>
        <CreatePedidoInternoForm
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />
      </Dialog>
    </PageContainer>
  );
};

export default PedidoInternoPage;
