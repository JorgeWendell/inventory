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

import UpsertNobreakForm from "./components/upsert-nobreak-form";
import NobreaksTable from "./components/nobreaks-table";
import NobreaksSearch from "./components/nobreaks-search";

const NobreaksPage = () => {
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
            <PageTitle>Nobreaks</PageTitle>
            <PageDescription>
              Gerencie o inventário de nobreaks
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4" />
                Novo Nobreak
              </Button>
            </DialogTrigger>
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="space-y-6">
            <div className="flex w-full justify-center">
              <NobreaksSearch onSearch={handleSearch} searchTerm={searchTerm} />
            </div>
            <NobreaksTable refreshKey={refreshKey} searchTerm={searchTerm} />
          </div>
        </PageContent>
        <UpsertNobreakForm
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

export default NobreaksPage;

