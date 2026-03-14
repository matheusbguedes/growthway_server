import { FastifyInstance } from "fastify"
import { AIService } from "../lib/ai/ai.service"

export async function aiRoutes(app: FastifyInstance) {

  app.get("/ai-test", async () => {

    const aiService = new AIService()

    const response = await aiService.generateText(
      "Explique em uma frase o que é um SaaS."
    )

    return {
      success: true,
      response
    }

  })

}