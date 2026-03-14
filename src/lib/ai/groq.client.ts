import axios from "axios"

export class GroqClient {

    private client
    private model = "llama-3.1-8b-instant"

    constructor(
        apiKey: string,
        baseUrl: string
    ) {
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            }
        })
    }

    async generate(
        prompt: string,
        maxTokens = 500,
        temperature = 0.7
    ): Promise<string> {

        try {
            const response = await this.client.post("/chat/completions", {
                model: this.model,
                messages: [
                    { role: "user", content: prompt }
                ],
                max_tokens: maxTokens,
                temperature
            })

            return response.data.choices[0].message.content

        }
        catch (error: unknown) {

            if (axios.isAxiosError(error)) {

                const status = error.response?.status
                const data = error.response?.data

                console.error("Groq API error", {
                    status,
                    data
                })

                throw new Error(
                    `Groq request failed${status ? ` (status ${status})` : ""}`
                )
            }

            console.error("Unexpected error calling Groq", error)

            throw new Error("Unexpected error calling Groq API")
        }
    }
}