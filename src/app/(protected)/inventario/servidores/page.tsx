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
import UpsertServidorForm from "./components/upsert-servidor-form";
import ServidoresTable from "./components/servidores-table";
import ServidoresSearch from "./components/servidores-search";

const ServidoresPage = () => {
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
            <PageTitle>Servidores</PageTitle>
            <PageDescription>
              Gerencie o inventário de servidores
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4" />
                Novo Servidor
              </Button>
            </DialogTrigger>
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="space-y-6">
            <div className="flex w-full justify-center">
              <ServidoresSearch onSearch={handleSearch} searchTerm={searchTerm} />
            </div>
            <ServidoresTable refreshKey={refreshKey} searchTerm={searchTerm} />
          </div>
        </PageContent>
        <UpsertServidorForm
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

export default ServidoresPage;
