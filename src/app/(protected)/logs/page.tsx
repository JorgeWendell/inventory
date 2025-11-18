"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/permissions/protected-route";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import LogsTable from "./components/logs-table";
import LogsSearch from "./components/logs-search";

const LogsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <ProtectedRoute route="/logs">
      <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Logs do Sistema</PageTitle>
          <PageDescription>
            Histórico de todas as alterações realizadas no sistema.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="space-y-6">
          <div className="flex w-full justify-center">
            <LogsSearch onSearch={handleSearch} searchTerm={searchTerm} />
          </div>
          <LogsTable searchTerm={searchTerm} />
        </div>
      </PageContent>
    </PageContainer>
    </ProtectedRoute>
  );
};

export default LogsPage;

