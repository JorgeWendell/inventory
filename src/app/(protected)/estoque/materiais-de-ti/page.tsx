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

import MateriaisTable from "./components/materiais-table";
import UpsertMaterialForm from "./components/upsert-material-form";

const MateriaisDeTiPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <ProtectedRoute route="/estoque/materiais-de-ti">
      <PageContainer>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Materiais de TI</PageTitle>
              <PageDescription>
                Cadastre e acompanhe o estoque dos materiais de TI.
              </PageDescription>
            </PageHeaderContent>
            <PermissionGate permission="estoque.edit">
              <PageActions>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
              </PageActions>
            </PermissionGate>
          </PageHeader>
        <PageContent>
          <MateriaisTable refreshKey={refreshKey} />
        </PageContent>
        <PermissionGate permission="estoque.edit">
          <UpsertMaterialForm
            open={isDialogOpen}
            setOpen={setIsDialogOpen}
            onSuccess={() => {
              setRefreshKey((prev) => prev + 1);
            }}
          />
        </PermissionGate>
      </Dialog>
    </PageContainer>
    </ProtectedRoute>
  );
};

export default MateriaisDeTiPage;
