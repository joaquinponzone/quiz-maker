import { questionSchema, questionsSchema } from "@/lib/schemas";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files } = await req.json();
  
  if (!files || !files[0]) {
    return new Response("No se proporcionó contenido", { status: 400 });
  }

  const result = streamObject({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "system",
        content:
          "Eres un profesor. Tu trabajo es tomar un documento y crear una prueba de opción múltiple (con 4 preguntas) basada en el contenido del documento. Cada opción debe tener aproximadamente la misma longitud. IMPORTANTE: Genera todo el contenido en español.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Crea una prueba de opción múltiple basada en este documento. Genera todo en español.",
          },
          {
            type: "file",
            data: files[0].data,
            mimeType: files[0].mimeType || "application/pdf",
          },
        ],
      },
    ],
    schema: questionSchema,
    output: "array",
    onFinish: ({ object }) => {
      const res = questionsSchema.safeParse(object);
      if (res.error) {
        throw new Error(res.error.errors.map((e) => e.message).join("\n"));
      }
    },
  });

  return result.toTextStreamResponse();
}
