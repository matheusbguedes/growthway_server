import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";
import { goalRoutes } from "./goal";
import { invoiceRoutes } from "./invoice";
import { lessonRoutes } from "./lesson";
import { studentRoutes } from "./student";
import { userRoutes } from "./user";

export async function appRoutes(app: FastifyInstance) {
  app.register(authRoutes);
  app.register(userRoutes, { prefix: "/users" });
  app.register(studentRoutes, { prefix: "/students" });
  app.register(goalRoutes, { prefix: "/:student_id/goals" });
  app.register(lessonRoutes, { prefix: "/:student_id/lessons" });
  app.register(invoiceRoutes, { prefix: "/:student_id/invoices" });
}
