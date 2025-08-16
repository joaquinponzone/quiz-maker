"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText } from "lucide-react";

interface GenerationCounterProps {
  currentCount: number;
  maxGenerations: number;
  remainingGenerations: number;
}

export default function GenerationCounter({ 
  currentCount, 
  maxGenerations, 
  remainingGenerations 
}: GenerationCounterProps) {
  const progressPercentage = (currentCount / maxGenerations) * 100;
  const isNearLimit = remainingGenerations <= 10;
  const isAtLimit = remainingGenerations === 0;

  return (
    <div className="p-3 rounded-lg border shadow-sm bg-muted/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Generaciones de Cuestionarios
          </span>
        </div>
        <Badge 
          variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "default"}
          className="text-xs"
        >
          {currentCount}/{maxGenerations}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={progressPercentage} 
          className="h-2"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isAtLimit 
              ? "Límite alcanzado" 
              : `${remainingGenerations} generaciones restantes`
            }
          </span>
          <span>
            {Math.round(progressPercentage)}% utilizado
          </span>
        </div>
      </div>
      
      {isNearLimit && !isAtLimit && (
        <div className="mt-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            ⚠️ Te quedan pocas generaciones. Considera solicitar acceso administrativo.
          </p>
        </div>
      )}
    </div>
  );
}

