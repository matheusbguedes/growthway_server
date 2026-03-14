import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";
import { classRoutes } from "./class";
import { goalRoutes } from "./goal";
import { invoiceRoutes } from "./invoice";
import { studentRoutes } from "./student";
import { userRoutes } from "./user";
import { aiRoutes } from "./ai";

export async function appRoutes(app: FastifyInstance) {
  app.register(authRoutes);
  app.register(userRoutes, { prefix: "/users" });
  app.register(studentRoutes, { prefix: "/students" });
  app.register(classRoutes, { prefix: "/:student_id/classes" });
  app.register(goalRoutes, { prefix: "/:student_id/goals" });
  app.register(invoiceRoutes, { prefix: "/:student_id/invoices" });
  app.register(aiRoutes, { prefix: "/ai" });
}
