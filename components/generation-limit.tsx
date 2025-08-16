"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Shield, Mail, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface GenerationLimitProps {
  onReset?: () => void;
}

export default function GenerationLimit({ onReset }: GenerationLimitProps) {
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [hasRequestedAccess, setHasRequestedAccess] = useState(false);

  const handleRequestAccess = async () => {
    setIsRequestingAccess(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsRequestingAccess(false);
    setHasRequestedAccess(true);
    toast.success("Solicitud de acceso enviada al administrador");
  };

  const handleResetCounter = () => {
    if (onReset) {
      onReset();
      toast.success("Contador reiniciado - ¡Puedes generar más cuestionarios!");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center space-x-2">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              Límite de Generaciones Alcanzado
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Has alcanzado el límite de 100 generaciones de cuestionarios.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                  Acceso Administrativo Requerido
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Para continuar generando cuestionarios ilimitados, necesitas solicitar acceso administrativo.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Generaciones utilizadas:</span>
              <Badge variant="destructive" className="text-sm">
                100/100
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Generaciones restantes:</span>
              <Badge variant="secondary" className="text-sm">
                0
              </Badge>
            </div>
          </div>

          {!hasRequestedAccess ? (
            <Button
              onClick={handleRequestAccess}
              disabled={isRequestingAccess}
              className="w-full shadow-md hover:shadow-lg transition-shadow"
            >
              {isRequestingAccess ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Enviando solicitud...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Solicitar Acceso Administrativo
                </>
              )}
            </Button>
          ) : (
            <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Solicitud enviada al administrador
                </span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Recibirás una notificación cuando tu solicitud sea aprobada.
              </p>
            </div>
          )}

          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleResetCounter}
              className="text-sm"
            >
              <RefreshCcw className="mr-2 h-3 w-3" />
              Reiniciar Contador (Demo)
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              ⚠️ Esta opción solo está disponible en modo demo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

