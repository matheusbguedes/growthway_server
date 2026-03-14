import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { z } from "zod";
 
export async function studentRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.verifyAuth);
 
  app.get("/", async (request, reply) => {
    try {
      const { sub: user_id } = request.user;
 
      const students = await prisma.student.findMany({
        where: { user_id },
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          created_at: true,
          goals: {
            where: { status: "IN_PROGRESS" },
            select: {
              id: true,
              title: true,
              status: true,
              start_at: true,
              end_at: true,
            },
          },
          lessons: {
            orderBy: { date: "desc" },
            take: 1,
            select: {
              id: true,
              date: true,
              title: true,
            },
          },
          invoices: {
            where: { status: "PENDING" },
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
        },
      });
 
      return reply.status(200).send(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      return reply.status(500).send({ message: "Erro ao buscar alunos" });
    }
  });
 
  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { sub: user_id } = request.user;
 
    try {
      const student = await prisma.student.findFirst({
        where: { id, user_id },
        include: {
          goals: {
            orderBy: { created_at: "desc" },
          },
          lessons: {
            orderBy: { date: "desc" },
          },
          invoices: {
            orderBy: { created_at: "desc" },
          },
        },
      });
 
      if (!student)
        return reply.status(404).send({ message: "Aluno não encontrado" });
 
      return reply.status(200).send(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      return reply.status(500).send({ message: "Erro ao buscar aluno" });
    }
  });
 
  app.post("/", async (request, reply) => {
    const bodySchema = z.object({
      name: z.string(),
      email: z.string().email().optional(),
      document: z.string().optional(),
      phone: z.string().optional(),
      status: z.enum(["ACTIVE", "INACTIVE", "PAUSED"]).default("ACTIVE"),
    });
 
    const { sub: user_id } = request.user;
 
    try {
      const { name, email, document, phone, status } = bodySchema.parse(
        request.body
      );
 
      if (email) {
        const existingEmail = await prisma.student.findFirst({
          where: { email, user_id },
        });
 
        if (existingEmail)
          return reply
            .status(409)
            .send({ message: "Já existe um aluno com esse e-mail" });
      }
 
      const student = await prisma.student.create({
        data: {
          name,
          email,
          document,
          phone,
          status,
          user_id,
        },
      });
 
      return reply.status(201).send(student);
    } catch (error) {
      console.error("Error creating student:", error);
      return reply.status(500).send({ message: "Erro ao criar aluno" });
    }
  });
 
  app.put("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { sub: user_id } = request.user;
 
    const bodySchema = z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      document: z.string().optional(),
      phone: z.string().optional(),
      status: z.enum(["ACTIVE", "INACTIVE", "PAUSED"]).optional(),
    });
 
    try {
      const { name, email, document, phone, status } = bodySchema.parse(
        request.body
      );
 
      const student = await prisma.student.findFirst({
        where: { id, user_id },
      });
 
      if (!student)
        return reply.status(404).send({ message: "Aluno não encontrado" });
 
      if (email) {
        const existingEmail = await prisma.student.findFirst({
          where: { id: { not: id }, email, user_id },
        });
 
        if (existingEmail)
          return reply
            .status(409)
            .send({ message: "Já existe um aluno com esse e-mail" });
      }
 
      const updated = await prisma.student.update({
        where: { id },
        data: {
          name,
          email,
          document,
          phone,
          status,
        },
      });
 
      return reply.status(200).send(updated);
    } catch (error) {
      console.error("Error updating student:", error);
      return reply.status(500).send({ message: "Erro ao atualizar aluno" });
    }
  });
 
  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { sub: user_id } = request.user;
 
    try {
      const student = await prisma.student.findFirst({
        where: { id, user_id },
      });
 
      if (!student)
        return reply.status(404).send({ message: "Aluno não encontrado" });
 
      const hasLessons = await prisma.lesson.findFirst({
        where: { student_id: id },
      });
 
      if (hasLessons)
        return reply
          .status(400)
          .send({ message: "Não é possível excluir aluno com aulas registradas" });
 
      const hasInvoices = await prisma.invoice.findFirst({
        where: { student_id: id },
      });
 
      if (hasInvoices)
        return reply
          .status(400)
          .send({ message: "Não é possível excluir aluno com faturas vinculadas" });
 
      await prisma.student.delete({ where: { id } });
 
      return reply.status(200).send({ message: "Aluno excluído com sucesso" });
    } catch (error) {
      console.error("Error deleting student:", error);
      return reply.status(500).send({ message: "Erro ao excluir aluno" });
    }
  });
}