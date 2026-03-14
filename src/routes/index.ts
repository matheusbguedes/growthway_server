import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";
import { userRoutes } from "./user";

export async function appRoutes(app: FastifyInstance) {
  app.register(authRoutes);
  app.register(userRoutes, { prefix: "/users" });
}
