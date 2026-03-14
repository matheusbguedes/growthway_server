import { GroqClient } from "./groq.client"
import { env } from "../../env"

export class AIService {

  private groq = new GroqClient(
    env.GROQ_API_KEY,
    env.GROQ_BASE_URL
  )

  async generateText(prompt: string): Promise<string> {
    return this.groq.generate(prompt)
  }

}