import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma-client";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function taskRoutes(app: FastifyInstance) {
  // TODO: reativar após login funcionar
  // app.addHook("preHandler", app.verifyAuth);

  // GET /tasks/:class_id
  app.get("/", async (request, reply) => {
    const { class_id } = request.params as { class_id: string };

    const querySchema = z.object({
      status: z.enum(TaskStatus).optional(),
    });

    try {
      const { status } = querySchema.parse(request.query);

      const tasks = await prisma.task.findMany({
        where: {
          class_id,
          ...(status && { status }),
        },
        orderBy: { created_at: "desc" },
        include: {
          class: {
            select: { id: true, title: true, date: true },
          },
        },
      });

      return reply.status(200).send(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return reply.status(500).send({ message: "Erro ao buscar tarefas" });
    }
  });

  // GET /tasks/:class_id/:id
  app.get("/:id", async (request, reply) => {
    const { class_id, id } = request.params as { class_id: string; id: string };

    try {
      const task = await prisma.task.findFirstOrThrow({
        where: { id, class_id },
        include: {
          class: {
            select: { id: true, title: true, date: true },
          },
        },
      });

      return reply.status(200).send(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      return reply.status(404).send({ message: "Tarefa não encontrada" });
    }
  });

  // POST /tasks/:class_id
  app.post("/", async (request, reply) => {
    const { class_id } = request.params as { class_id: string };

    const bodySchema = z.object({
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      status: z.enum(TaskStatus).default(TaskStatus.PENDING),
      due_date: z.coerce.date().optional().nullable(),
    });

    try {
      const { title, description, status, due_date } = bodySchema.parse(
        request.body,
      );

      const task = await prisma.task.create({
        data: {
          class_id,
          title,
          description,
          status,
          due_date: due_date ?? undefined,
        },
      });

      return reply.status(201).send(task);
    } catch (error) {
      console.error("Error creating task:", error);
      return reply.status(500).send({ message: "Erro ao criar tarefa" });
    }
  });

  // PUT /tasks/:class_id/:id
  app.put("/:id", async (request, reply) => {
    const { class_id, id } = request.params as { class_id: string; id: string };

    const bodySchema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      status: z.enum(TaskStatus).optional(),
      due_date: z.coerce.date().optional().nullable(),
    });

    try {
      const { title, description, status, due_date } = bodySchema.parse(
        request.body,
      );

      const task = await prisma.task.update({
        where: { id, class_id },
        data: {
          title,
          description,
          status,
          due_date: due_date ?? undefined,
        },
      });

      return reply.status(200).send(task);
    } catch (error) {
      console.error("Error updating task:", error);
      return reply.status(500).send({ message: "Erro ao atualizar tarefa" });
    }
  });

  // DELETE /tasks/:class_id/:id
  app.delete("/:id", async (request, reply) => {
    const { class_id, id } = request.params as { class_id: string; id: string };

    try {
      await prisma.task.delete({ where: { id, class_id } });

      return reply.status(200).send({ message: "Tarefa excluída com sucesso" });
    } catch (error) {
      console.error("Error deleting task:", error);
      return reply.status(500).send({ message: "Erro ao excluir tarefa" });
    }
  });
}