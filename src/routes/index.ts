import { FastifyInstance } from "fastify";
import { aiRoutes } from "./ai";
import { authRoutes } from "./auth";
import { classRoutes } from "./class";
import { dashboardRoutes } from "./dashboard";
import { goalRoutes } from "./goal";
import { invoiceRoutes } from "./invoice";
import { studentRoutes } from "./student";
import { userRoutes } from "./user";

export async function appRoutes(app: FastifyInstance) {
  app.register(authRoutes);
  app.register(dashboardRoutes, { prefix: "/dashboard" });
  app.register(userRoutes, { prefix: "/users" });
  app.register(studentRoutes, { prefix: "/students" });
  app.register(classRoutes, { prefix: "/classes" });
  app.register(goalRoutes, { prefix: "/:student_id/goals" });
  app.register(invoiceRoutes, { prefix: "/:student_id/invoices" });
  app.register(aiRoutes, { prefix: "/ai" });
}
