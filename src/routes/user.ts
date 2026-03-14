import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function userRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.verifyAuth);

  app.get("/", async (_, reply) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return reply.status(200).send(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return reply.status(500).send({ message: "Erro ao buscar usuários" });
    }
  });

  app.post("/", async (request, reply) => {
    const bodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    });

    try {
      const { name, email, password } = bodySchema.parse(request.body);

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return reply.status(201).send(user);
    } catch (error) {
      console.error("Error creating user:", error);
      return reply.status(500).send({ message: "Erro ao criar usuário" });
    }
  });

  app.put("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const bodySchema = z.object({
      name: z.string().optional(),
      email: z.string().optional(),
    });

    try {
      const { name, email } = bodySchema.parse(request.body);

      const user = await prisma.user.update({
        where: { id },
        data: {
          name,
          email,
        },
      });

      return reply.status(200).send(user);
    } catch (error) {
      console.error("Error updating user:", error);
      return reply.status(500).send({ message: "Erro ao atualizar usuário" });
    }
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await prisma.user.delete({ where: { id } });

      return reply
        .status(200)
        .send({ message: "Usuário excluído com sucesso" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return reply.status(500).send({ message: "Erro ao excluir usuário" });
    }
  });
}
