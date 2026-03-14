import { prisma } from "@/lib/prisma";
import { ClassStatus } from "@prisma-client";
import { FastifyInstance } from "fastify";

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.verifyAuth);

  app.get("/", async (request, reply) => {
    try {
      const [totalStudents, completedClasses, pendingClasses] =
        await Promise.all([
          prisma.student.count({
            where: {
              classes: {
                some: {
                  user_id: request.user.sub,
                },
              },
            },
          }),
          prisma.class.count({
            where: {
              user_id: request.user.sub,
              status: ClassStatus.COMPLETED,
            },
          }),
          prisma.class.count({
            where: {
              user_id: request.user.sub,
              status: ClassStatus.PENDING,
            },
          }),
        ]);

      return reply.status(200).send({
        total_students: totalStudents,
        completed_classes: completedClasses,
        pending_classes: pendingClasses,
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      return reply.status(500).send({ message: "Erro ao carregar dashboard" });
    }
  });
}
