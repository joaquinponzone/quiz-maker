"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const generateQuizTitle = async (file: string) => {
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      title: z
        .string()
        .describe(
          "Un título de máximo tres palabras para el cuestionario basado en el archivo proporcionado como contexto",
        ),
    }),
    prompt:
      "Genera un título en español para un cuestionario basado en el siguiente nombre de archivo (PDF). Intenta extraer la mayor cantidad de información posible del nombre del archivo. Si el nombre del archivo son solo números o es incoherente, simplemente devuelve 'Cuestionario'.\n\n " + file,
  });
  return result.object.title;
};
