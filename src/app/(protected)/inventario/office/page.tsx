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

import UpsertOfficeForm from "./components/upsert-office-form";
import OfficeTable from "./components/office-table";
import OfficeSearch from "./components/office-search";

const OfficePage = () => {
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
            <PageTitle>Office</PageTitle>
            <PageDescription>
              Gerencie as licenças do Microsoft Office
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4" />
                Nova Licença
              </Button>
            </DialogTrigger>
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="space-y-6">
            <div className="flex w-full justify-center">
              <OfficeSearch onSearch={handleSearch} searchTerm={searchTerm} />
            </div>
            <OfficeTable refreshKey={refreshKey} searchTerm={searchTerm} />
          </div>
        </PageContent>
        <UpsertOfficeForm
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

export default OfficePage;

