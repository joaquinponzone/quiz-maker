"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { FileInput } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Chequeando cache..." }: LoadingScreenProps) {
  return (
      <Card className="w-full max-w-md shadow-lg p-6 mt-32">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <FileInput className="animate-pulse size-16 text-primary" />
            <p className="text-lg font-bold">{message}</p>
          </div>
        </CardHeader>
      </Card>
  );
}
