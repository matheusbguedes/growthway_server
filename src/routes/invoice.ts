import { prisma } from "@/lib/prisma";
import { InvoiceStatus, PaymentMethod } from "@prisma-client";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function invoiceRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.verifyAuth);

  app.get("/", async (request, reply) => {
    const querySchema = z.object({
      student_id: z.uuid(),
      status: z.enum(InvoiceStatus).optional(),
    });

    try {
      const { student_id, status } = querySchema.parse(request.query);

      const invoices = await prisma.invoice.findMany({
        where: {
          student_id,
          ...(status && { status }),
        },
        orderBy: { created_at: "desc" },
        include: {
          student: {
            select: { id: true, name: true },
          },
        },
      });

      return reply.status(200).send(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return reply.status(500).send({ message: "Erro ao buscar cobranças" });
    }
  });

  app.get("/:id", async (request, reply) => {
    const { student_id, id } = request.params as {
      id: string;
      student_id: string;
    };

    try {
      const invoice = await prisma.invoice.findFirstOrThrow({
        where: { id, student_id },
        include: {
          student: {
            select: { id: true, name: true },
          },
        },
      });

      return reply.status(200).send(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return reply.status(404).send({ message: "Cobrança não encontrada" });
    }
  });

  app.post("/", async (request, reply) => {
    const { student_id } = request.params as { student_id: string };

    const bodySchema = z.object({
      amount: z.number().positive(),
      payment_method: z.enum(PaymentMethod),
      status: z.enum(InvoiceStatus).default(InvoiceStatus.PENDING),
      notes: z.string().optional().nullable(),
    });

    try {
      const { amount, payment_method, status, notes } = bodySchema.parse(
        request.body,
      );

      const invoice = await prisma.invoice.create({
        data: {
          student_id,
          amount,
          payment_method,
          status,
          notes,
        },
      });

      return reply.status(201).send(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      return reply.status(500).send({ message: "Erro ao criar cobrança" });
    }
  });

  app.put("/:id", async (request, reply) => {
    const { id, student_id } = request.params as {
      id: string;
      student_id: string;
    };

    const bodySchema = z.object({
      amount: z.number().positive().optional(),
      payment_method: z.enum(PaymentMethod).optional(),
      status: z.enum(InvoiceStatus).optional(),
      notes: z.string().optional().nullable(),
    });

    try {
      const { amount, payment_method, status, notes } = bodySchema.parse(
        request.body,
      );

      const invoice = await prisma.invoice.update({
        where: { id, student_id },
        data: {
          amount,
          payment_method,
          status,
          notes,
        },
      });

      return reply.status(200).send(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      return reply.status(500).send({ message: "Erro ao atualizar cobrança" });
    }
  });

  app.delete("/:id", async (request, reply) => {
    const { id, student_id } = request.params as {
      id: string;
      student_id: string;
    };

    try {
      await prisma.invoice.delete({ where: { id, student_id } });

      return reply
        .status(200)
        .send({ message: "Cobrança excluída com sucesso" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return reply.status(500).send({ message: "Erro ao excluir cobrança" });
    }
  });
}
