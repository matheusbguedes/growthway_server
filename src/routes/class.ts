import { prisma } from "@/lib/prisma";
import { ClassStatus } from "@prisma-client";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function classRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.verifyAuth);

  app.get("/", async (request, reply) => {
    try {
      const classes = await prisma.class.findMany({
        where: { user_id: request.user.sub },
        orderBy: { date: "desc" },
        include: {
          student: {
            select: { id: true, name: true },
          },
        },
      });

      return reply.status(200).send(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      return reply.status(500).send({ message: "Erro ao buscar aulas" });
    }
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as {
      id: string;
    };

    try {
      const class_ = await prisma.class.findFirstOrThrow({
        where: { id, user_id: request.user.sub },
      });

      return reply.status(200).send(class_);
    } catch (error) {
      console.error("Error fetching class:", error);
      return reply.status(500).send({ message: "Erro ao buscar aula" });
    }
  });

  app.get("/student/:student_id", async (request, reply) => {
    const querySchema = z.object({
      student_id: z.uuid(),
    });

    try {
      const { student_id } = querySchema.parse(request.query);

      const classes = await prisma.class.findMany({
        where: { student_id, user_id: request.user.sub },
        orderBy: { date: "desc" },
        include: {
          student: {
            select: { id: true, name: true },
          },
        },
      });

      return reply.status(200).send(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      return reply.status(500).send({ message: "Erro ao buscar aulas" });
    }
  });

  app.post("/", async (request, reply) => {
    const { student_id } = request.params as { student_id: string };

    const bodySchema = z.object({
      date: z.coerce.date().optional(),
      title: z.string().optional().nullable(),
      description: z.string().min(1),
      status: z.enum(ClassStatus).default(ClassStatus.PENDING),
      url: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      goal_id: z.uuid().optional(),
    });

    try {
      const { date, title, description, status, url, notes, goal_id } =
        bodySchema.parse(request.body);

      const class_ = await prisma.class.create({
        data: {
          student_id,
          date,
          title,
          description,
          status,
          url,
          notes,
          user_id: request.user.sub,
          goal_id: goal_id ?? undefined,
        },
      });

      return reply.status(201).send(class_);
    } catch (error) {
      console.error("Error creating class:", error);
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
      description: z.string().min(1).optional(),
      status: z.enum(ClassStatus).optional(),
      url: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      goal_id: z.uuid().optional(),
    });

    try {
      const { date, title, description, status, url, notes, goal_id } =
        bodySchema.parse(request.body);

      const class_ = await prisma.class.update({
        where: { id, student_id },
        data: {
          date,
          title,
          description,
          status,
          url,
          notes,
          goal_id: goal_id ?? undefined,
          user_id: request.user.sub,
        },
      });

      return reply.status(200).send(class_);
    } catch (error) {
      console.error("Error updating class:", error);
      return reply.status(500).send({ message: "Erro ao atualizar aula" });
    }
  });

  app.delete("/:id", async (request, reply) => {
    const { id, student_id } = request.params as {
      id: string;
      student_id: string;
    };

    try {
      await prisma.class.delete({ where: { id, student_id } });

      return reply.status(200).send({ message: "Aula excluída com sucesso" });
    } catch (error) {
      console.error("Error deleting class:", error);
      return reply.status(500).send({ message: "Erro ao excluir aula" });
    }
  });
}
