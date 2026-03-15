import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.verifyAuth);

  app.get("/", async (request, reply) => {
    const userId = request.user.sub;

    if (!userId) {
      return reply.status(400).send({ message: "UserId não encontrado. Passe ?user_id_test=ID no Postman" });
    }

    try {
      const [
        totalStudents,
        completedClasses,
        pendingClasses,
        studentStatusDistribution,
        classesStatusDistribution
      ] = await Promise.all([
        prisma.student.count({ where: { user_id: userId } }),
        prisma.class.count({ where: { user_id: userId, status: "COMPLETED" } }),
        prisma.class.count({ where: { user_id: userId, status: "PENDING" } }),

        prisma.student.groupBy({
          by: ['status'],
          where: { user_id: userId },
          _count: { status: true }
        }),

        prisma.class.groupBy({
          by: ['status'],
          where: { user_id: userId },
          _count: { status: true }
        })
      ]);

      return reply.status(200).send({
        metrics: {
          total_students: totalStudents,
          completed_classes: completedClasses,
          pending_classes: pendingClasses,
        },
        charts: {
          student_status: studentStatusDistribution.map(item => ({
            label: item.status,
            value: item._count.status
          })),
          classes_status: classesStatusDistribution.map(item => ({
            status: item.status,
            count: item._count.status
          }))
        }
      });
    } catch (error) {
      console.error("Dashboard Error:", error);
      return reply.status(500).send({ message: "Erro ao carregar dashboard" });
    }
  });
}