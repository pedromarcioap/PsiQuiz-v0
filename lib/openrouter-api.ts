import { NextResponse } from "next/server"

interface OpenRouterApiCallParams {
  model: string
  messages: Array<{ role: string; content: string }>
  max_tokens?: number
  temperature?: number
  response_format?: { type: "json_object" }
}

export async function callOpenRouterApi(
  params: OpenRouterApiCallParams,
  referer: string = "https://psiquiz-ai.vercel.app",
  title: string = "PsiQuiz AI Server"
) {
  const openrouterKey = process.env.OPENROUTER_API_KEY

  if (!openrouterKey) {
    return { success: false, error: "OPENROUTER_API_KEY não configurada no ambiente do servidor." }
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": title,
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenRouter API Error:", errorData)
      return {
        success: false,
        error: `Erro na API OpenRouter: ${response.status} - ${errorData.message || "Erro desconhecido"}`,
        statusCode: response.status,
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error("Falha na chamada da API OpenRouter:", error)
    return { success: false, error: `Falha na conexão do servidor: ${error.message}` }
  }
}