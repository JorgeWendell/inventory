"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { setFirstAdmin } from "@/actions/set-first-admin";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SetAdminPage = () => {
  const [email, setEmail] = useState("teste@a.com");

  const setAdminAction = useAction(setFirstAdmin, {
    onSuccess: (result) => {
      toast.success(
        result.data?.message || `Usuário ${email} definido como ADMINISTRATOR!`,
      );
    },
    onError: (error) => {
      const emailError = error.error?.validationErrors?.email;
      const message =
        error.error?.serverError ||
        (emailError && "_errors" in emailError
          ? emailError._errors?.[0]
          : undefined) ||
        error.error?.thrownError?.message ||
        "Erro ao definir administrador";
      toast.error(message);
    },
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <PageTitle>Definir Primeiro Administrador</PageTitle>
          </div>
          <PageDescription>
            Use esta página apenas uma vez para definir o primeiro administrador do sistema.
            Após isso, você pode remover esta página.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Definir Administrador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Email do usuário
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teste@a.com"
              />
            </div>
            <Button
              onClick={() => setAdminAction.execute({ email })}
              disabled={setAdminAction.status === "executing" || !email}
              className="w-full"
            >
              {setAdminAction.status === "executing"
                ? "Processando..."
                : "Definir como ADMINISTRATOR"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Esta página deve ser removida após definir o primeiro admin
            </p>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default SetAdminPage;

