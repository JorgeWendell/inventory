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
import UpsertAcessoDepartamentoForm from "./components/upsert-acesso-departamento-form";
import AcessosDepartamentosTable from "./components/acessos-departamentos-table";
import AcessosDepartamentosSearch from "./components/acessos-departamentos-search";

const AcessosDepartamentosPage = () => {
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
            <PageTitle>Acessos e Departamentos</PageTitle>
            <PageDescription>
              Gerencie os acessos e departamentos do sistema
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4" />
                Novo Acesso
              </Button>
            </DialogTrigger>
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="space-y-6">
            <div className="flex w-full justify-center">
              <AcessosDepartamentosSearch
                onSearch={handleSearch}
                searchTerm={searchTerm}
              />
            </div>
            <AcessosDepartamentosTable
              refreshKey={refreshKey}
              searchTerm={searchTerm}
            />
          </div>
        </PageContent>
        <UpsertAcessoDepartamentoForm
          open={isOpen}
          setOpen={setIsOpen}
          onSuccess={() => {
            setIsOpen(false);
            setRefreshKey((prev) => prev + 1);
          }}
        />
      </Dialog>
    </PageContainer>
  );
};

export default AcessosDepartamentosPage;
