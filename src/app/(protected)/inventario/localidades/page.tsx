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

import UpsertLocalidadeForm from "./components/upsert-localidade-form";
import LocalidadesTable from "./components/localidades-table";
import LocalidadesSearch from "./components/localidades-search";

const LocalidadesPage = () => {
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
            <PageTitle>Localidades</PageTitle>
            <PageDescription>
              Gerencie as localidades do inventário
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4" />
                Nova Localidade
              </Button>
            </DialogTrigger>
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="space-y-6">
            <div className="flex w-full justify-center">
              <LocalidadesSearch
                onSearch={handleSearch}
                searchTerm={searchTerm}
              />
            </div>
            <LocalidadesTable refreshKey={refreshKey} searchTerm={searchTerm} />
          </div>
        </PageContent>
        <UpsertLocalidadeForm
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

export default LocalidadesPage;
