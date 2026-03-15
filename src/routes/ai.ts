import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { AIService } from "../lib/ai/ai.service";

const lessonSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const aiPlanResponseSchema = z.array(lessonSchema).length(5);

function parseJsonFromAi(raw: string): z.infer<typeof aiPlanResponseSchema> {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const parsed = JSON.parse(trimmed) as unknown;
  return aiPlanResponseSchema.parse(parsed);
}

export async function aiRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.verifyAuth);

  app.post("/class-plan", async (request, reply) => {
    const bodySchema = z.object({
      student_id: z.uuid(),
      title: z.string().min(1, "Título do objetivo é obrigatório"),
      approach_description: z
        .string()
        .min(1, "Descrição da abordagem é obrigatória"),
    });

    const { student_id, title, approach_description } = bodySchema.parse(
      request.body,
    );

    const student = await prisma.student.findFirst({
      where: { id: student_id, user_id: request.user.sub },
    });
    if (!student) {
      return reply.status(404).send({ message: "Aluno não encontrado" });
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description: approach_description,
      },
    });

    const aiService = new AIService();
    const prompt = `Você é um planejador de aulas. Com base no objetivo e na abordagem abaixo, crie exatamente 5 aulas em sequência para cumprir esse objetivo.

Objetivo: ${title}
Abordagem: ${approach_description}

Responda APENAS com um JSON válido, sem texto antes ou depois, no formato:
[{"title":"Título da aula 1","description":"Descrição do que será trabalhado na aula 1"},{"title":"Título da aula 2","description":"..."}, ...]

São exatamente 5 objetos no array, cada um com "title" e "description" em português.`;

    const rawResponse = await aiService.generateText(prompt, {
      maxTokens: 1500,
    });

    let lessons: z.infer<typeof aiPlanResponseSchema>;
    try {
      lessons = parseJsonFromAi(rawResponse);
    } catch {
      return reply.status(502).send({
        message: "Resposta da IA em formato inválido; tente novamente.",
      });
    }

    const startDate = new Date(goal.start_at);
    startDate.setHours(0, 0, 0, 0);

    const classes = await prisma.$transaction(
      lessons.map((lesson, index) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + index * 7);
        return prisma.class.create({
          data: {
            user_id: request.user.sub,
            student_id,
            goal_id: goal.id,
            date,
            title: lesson.title,
            description: lesson.description,
          },
        });
      }),
    );

    return reply.status(201).send({
      goal,
      classes,
    });
  });
}
