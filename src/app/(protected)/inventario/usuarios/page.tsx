"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageActions,
} from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertUsuarioForm from "./components/upsert-usuario-form";
import UsuariosTable from "./components/usuarios-table";
import UsuariosSearch from "./components/usuarios-search";

const UsuariosPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <PageContainer>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Usuários</PageTitle>
            <PageDescription>Gerencie os usuários do sistema</PageDescription>
          </PageHeaderContent>
          <PageActions>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="space-y-6">
            <div className="flex w-full justify-center">
              <UsuariosSearch onSearch={handleSearch} searchTerm={searchTerm} />
            </div>
            <UsuariosTable refreshKey={refreshKey} searchTerm={searchTerm} />
          </div>
        </PageContent>
        <UpsertUsuarioForm
          open={isOpen}
          setOpen={setIsOpen}
          onSuccess={() => {
            setRefreshKey((prev) => prev + 1);
          }}
        />
      </Dialog>
    </PageContainer>
  );
};

export default UsuariosPage;
