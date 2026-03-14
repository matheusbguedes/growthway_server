import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function lessonRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.verifyAuth);

  app.get("/", async (request, reply) => {
    const querySchema = z.object({
      student_id: z.uuid(),
    });

    try {
      const { student_id } = querySchema.parse(request.query);

      const lessons = await prisma.lesson.findMany({
        where: { student_id },
        orderBy: { date: "desc" },
        include: {
          student: {
            select: { id: true, name: true },
          },
        },
      });

      return reply.status(200).send(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      return reply.status(500).send({ message: "Erro ao buscar aulas" });
    }
  });

  app.get("/:id", async (request, reply) => {
    const { student_id, id } = request.params as {
      student_id: string;
      id: string;
    };

    try {
      const lesson = await prisma.lesson.findFirstOrThrow({
        where: { id, student_id },
      });

      return reply.status(200).send(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      return reply.status(500).send({ message: "Erro ao buscar aula" });
    }
  });

  app.post("/", async (request, reply) => {
    const { student_id } = request.params as { student_id: string };

    const bodySchema = z.object({
      date: z.coerce.date().optional(),
      title: z.string().optional().nullable(),
      content: z.string().min(1),
      duration: z.number().int().positive().optional().nullable(),
      notes: z.string().optional().nullable(),
    });

    try {
      const { date, title, content, duration, notes } = bodySchema.parse(
        request.body,
      );

      const lesson = await prisma.lesson.create({
        data: {
          student_id,
          date,
          title,
          content,
          duration,
          notes,
        },
      });

      return reply.status(201).send(lesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      return reply.status(500).send({ message: "Erro ao criar aula" });
    }
  });

  app.put("/:id", async (request, reply) => {
    const { student_id, id } = request.params as {
      student_id: string;
      id: string;
    };

    const bodySchema = z.object({
      date: z.coerce.date().optional(),
      title: z.string().optional().nullable(),
      content: z.string().min(1).optional(),
      duration: z.number().int().positive().optional().nullable(),
      notes: z.string().optional().nullable(),
    });

    try {
      const { date, title, content, duration, notes } = bodySchema.parse(
        request.body,
      );

      const lesson = await prisma.lesson.update({
        where: { id, student_id },
        data: {
          date,
          title,
          content,
          duration,
          notes,
        },
      });

      return reply.status(200).send(lesson);
    } catch (error) {
      console.error("Error updating lesson:", error);
      return reply.status(500).send({ message: "Erro ao atualizar aula" });
    }
  });

  app.delete("/:id", async (request, reply) => {
    const { id, student_id } = request.params as {
      id: string;
      student_id: string;
    };

    try {
      await prisma.lesson.delete({ where: { id, student_id } });

      return reply.status(200).send({ message: "Aula excluída com sucesso" });
    } catch (error) {
      console.error("Error deleting lesson:", error);
      return reply.status(500).send({ message: "Erro ao excluir aula" });
    }
  });
}
