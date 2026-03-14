import { prisma } from "@/lib/prisma";
import { GoalStatus } from "@prisma-client";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function goalRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.verifyAuth);

  app.get("/:student_id", async (request, reply) => {
    const { student_id } = request.params as { student_id: string };

    const goals = await prisma.goal.findMany({
      where: { classes: { some: { student_id } } },
    });

    return reply.status(200).send(goals);
  });

  app.post("/", async (request, reply) => {
    const bodySchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      status: z.enum(GoalStatus).default(GoalStatus.IN_PROGRESS),
      start_at: z.coerce.date().optional().nullable(),
      end_at: z.coerce.date().optional().nullable(),
    });

    try {
      const { title, description, status, start_at, end_at } = bodySchema.parse(
        request.body,
      );

      const goal = await prisma.goal.create({
        data: {
          title,
          description,
          status,
          start_at: start_at ?? undefined,
          end_at: end_at ?? undefined,
        },
      });

      return reply.status(201).send(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      return reply.status(500).send({ message: "Erro ao criar meta" });
    }
  });

  app.put("/:id", async (request, reply) => {
    const { id } = request.params as {
      id: string;
    };

    const bodySchema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      status: z.enum(GoalStatus).optional(),
      start_at: z.coerce.date().optional().nullable(),
      end_at: z.coerce.date().optional().nullable(),
    });

    try {
      const { title, description, status, start_at, end_at } = bodySchema.parse(
        request.body,
      );

      const goal = await prisma.goal.update({
        where: { id },
        data: {
          title,
          description,
          status,
          start_at: start_at ?? undefined,
          end_at: end_at ?? undefined,
        },
      });

      return reply.status(200).send(goal);
    } catch (error) {
      console.error("Error updating goal:", error);
      return reply.status(500).send({ message: "Erro ao atualizar meta" });
    }
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as {
      id: string;
    };

    try {
      await prisma.goal.delete({ where: { id } });

      return reply.status(200).send({ message: "Meta excluída com sucesso" });
    } catch (error) {
      console.error("Error deleting goal:", error);
      return reply.status(500).send({ message: "Erro ao excluir meta" });
    }
  });
}
