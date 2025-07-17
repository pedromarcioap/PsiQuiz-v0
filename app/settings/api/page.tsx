"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Key, Brain, Zap, CheckCircle, AlertCircle, History, Trash2 } from "lucide-react"
import Link from "next/link"
import { aiService } from "@/lib/ai-service"
import { testOpenRouterConnection } from "@/app/actions/openrouter" // Import the new Server Action

interface APIConfig {
  openrouterKeyInput: string // For temporary input display
  selectedModel: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  enableLogging: boolean
}

interface ConversationHistory {
  id: string
  timestamp: string
  model: string
  prompt: string
  response: string
  tokensUsed: number
  cost: number
}

interface OpenRouterModel {
  id: string
  name: string
  provider: {
    name: string
    id: string
  }
  pricing: {
    prompt: string
    completion: string
    unit: string
  }
}

export default function APISettingsPage() {
  const [config, setConfig] = useState<APIConfig>({
    openrouterKeyInput: "", // Initialize for input field
    selectedModel: "openai/gpt-4o-mini",
    systemPrompt: `Você é um especialista em Psicologia com PhD e 20 anos de experiência em ensino universitário. Crie questões de múltipla escolha sofisticadas que testem compreensão profunda, não memorização.

ESTRATÉGIAS PARA DISTRATORES DE ALTA QUALIDADE:
1. INVERSÃO DE CONCEITOS: Use conceitos verdadeiros aplicados incorretamente
2. INFORMAÇÃO PARCIAL: Respostas tecnicamente corretas mas incompletas
3. TERMINOLOGIA CRUZADA: Misture termos de diferentes áreas da psicologia
4. OPINIÕES DISFARÇADAS: Apresente opiniões como se fossem fatos científicos
5. GENERALIZAÇÕES: Transforme casos específicos em regras gerais
6. SIMPLIFICAÇÕES: Reduza conceitos complexos de forma enganosa

FORMATO DE SAÍDA (JSON):
{
  "questions": [
    {
      "question": "Pergunta clara e específica",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explicação detalhada",
      "difficulty": "Básico|Intermediário|Avançado",
      "topic": "Área específica da psicologia",
      "distractorAnalysis": "Explicação dos distratores usados"
    }
  ]
}`,
    temperature: 0.7,
    maxTokens: 2000,
    enableLogging: true,
  })

  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)

  useEffect(() => {
    // Load saved configurations (including openrouterKeyInput for display)
    const savedConfig = localStorage.getItem("psiquiz-api-config")
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig)
      setConfig((prev) => ({ ...prev, ...parsedConfig }))
    }

    // Load conversation history
    const savedHistory = localStorage.getItem("psiquiz-conversation-history")
    if (savedHistory) {
      setConversationHistory(JSON.parse(savedHistory))
    }

    // Fetch available models
    const fetchModels = async () => {
      setIsLoadingModels(true)
      try {
        const models = await aiService.fetchAvailableModels()
        setAvailableModels(models)
        // Set a default selected model if the current one is not in the fetched list
        if (models.length > 0 && !models.some((m) => m.id === config.selectedModel)) {
          setConfig((prev) => ({ ...prev, selectedModel: models[0].id }))
        }
      } catch (error) {
        console.error("Failed to fetch models:", error)
        // Fallback to a default model if fetching fails
        setAvailableModels([
          {
            id: "openai/gpt-4o-mini",
            name: "GPT-4o Mini",
            provider: { name: "OpenAI", id: "openai" },
            pricing: { prompt: "$0.15", completion: "$0.60", unit: "1M" },
          } as OpenRouterModel,
        ])
      } finally {
        setIsLoadingModels(false)
      }
    }
    fetchModels()
  }, [])

  const saveConfig = () => {
    // Save all config, including openrouterKeyInput for display persistence
    localStorage.setItem("psiquiz-api-config", JSON.stringify(config))
    aiService.updateConfig(config) // Update the singleton instance
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus("idle")

    try {
      // Call the server action to test the connection
      const result = await testOpenRouterConnection(config.selectedModel)

      if (result.success) {
        setConnectionStatus("success")
        // Add to history (using a placeholder for tokens/cost as it's a simple test)
        const newEntry: ConversationHistory = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          model: config.selectedModel,
          prompt: "Teste de conexão (via Server Action)",
          response: result.message,
          tokensUsed: 0, // Placeholder
          cost: 0, // Placeholder
        }

        const updatedHistory = [newEntry, ...conversationHistory].slice(0, 100)
        setConversationHistory(updatedHistory)
        localStorage.setItem("psiquiz-conversation-history", JSON.stringify(updatedHistory))
      } else {
        setConnectionStatus("error")
      }
    } catch (error) {
      console.error("Error testing connection via Server Action:", error)
      setConnectionStatus("error")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const clearHistory = () => {
    setConversationHistory([])
    localStorage.removeItem("psiquiz-conversation-history")
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Key className="h-5 w-5 text-gray-400" />
    }
  }

  const totalCost = conversationHistory.reduce((acc, conv) => acc + conv.cost, 0)
  const totalTokens = conversationHistory.reduce((acc, conv) => acc + conv.tokensUsed, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Key className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Configurações de API</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  OpenRouter API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-key">Chave da API OpenRouter</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="sk-or-v1-..."
                      value={config.openrouterKeyInput}
                      onChange={(e) => setConfig((prev) => ({ ...prev, openrouterKeyInput: e.target.value }))}
                      // Removed 'disabled' to allow user to type, but it's not used for direct calls
                    />
                    <Button onClick={testConnection} disabled={isTestingConnection} variant="outline">
                      {isTestingConnection ? "Testando..." : "Testar Conexão do Servidor"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusIcon()}
                    <span className="text-sm text-gray-600">
                      {connectionStatus === "success" && "Conexão do servidor estabelecida com sucesso!"}
                      {connectionStatus === "error" &&
                        "Erro na conexão do servidor. Verifique a variável de ambiente OPENROUTER_API_KEY."}
                      {connectionStatus === "idle" && "Configure a variável de ambiente OPENROUTER_API_KEY no Vercel."}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Obtenha sua chave em{" "}
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                      rel="noreferrer"
                    >
                      openrouter.ai/keys
                    </a>
                    . **Defina-a como uma variável de ambiente `OPENROUTER_API_KEY` no seu projeto Vercel.**
                  </p>
                </div>

                <div>
                  <Label>Modelo de IA</Label>
                  <Select
                    value={config.selectedModel}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, selectedModel: value }))}
                    disabled={isLoadingModels}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingModels ? "Carregando modelos..." : "Selecione um modelo"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{model.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {model.provider?.name || model.provider?.id || "Unknown"}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Custo: {availableModels.find((m) => m.id === config.selectedModel)?.pricing.prompt} /{" "}
                    {availableModels.find((m) => m.id === config.selectedModel)?.pricing.completion} por{" "}
                    {availableModels.find((m) => m.id === config.selectedModel)?.pricing.unit} tokens
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Temperatura: {config.temperature}</Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, temperature: Number.parseFloat(e.target.value) }))
                      }
                      className="w-full mt-2"
                    />
                    <p className="text-xs text-gray-500">Criatividade da IA (0 = conservador, 1 = criativo)</p>
                  </div>

                  <div>
                    <Label>Max Tokens: {config.maxTokens}</Label>
                    <input
                      type="range"
                      min="500"
                      max="4000"
                      step="100"
                      value={config.maxTokens}
                      onChange={(e) => setConfig((prev) => ({ ...prev, maxTokens: Number.parseInt(e.target.value) }))}
                      className="w-full mt-2"
                    />
                    <p className="text-xs text-gray-500">Tamanho máximo da resposta</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Habilitar Log de Conversas</Label>
                  <Switch
                    checked={config.enableLogging}
                    onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, enableLogging: checked }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveConfig} className="flex-1">
                    {isSaved ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Salvo!
                      </>
                    ) : (
                      "Salvar Configurações"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  System Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="system-prompt">Instruções para a IA</Label>
                  <Textarea
                    id="system-prompt"
                    value={config.systemPrompt}
                    onChange={(e) => setConfig((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                    rows={15}
                    className="text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Este prompt define como a IA deve gerar questões e distratores
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Estatísticas de Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total de Conversas</span>
                    <span className="font-semibold">{conversationHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tokens Utilizados</span>
                    <span className="font-semibold">{totalTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Custo Estimado</span>
                    <span className="font-semibold text-green-600">${totalCost.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Modelo Atual</span>
                    <Badge variant="outline" className="text-xs">
                      {availableModels.find((m) => m.id === config.selectedModel)?.name || config.selectedModel}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversation History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Histórico
                  </CardTitle>
                  {conversationHistory.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {conversationHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhuma conversa registrada ainda</p>
                  ) : (
                    conversationHistory.slice(0, 10).map((conv) => (
                      <div key={conv.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {availableModels.find((m) => m.id === conv.model)?.name || conv.model}
                          </Badge>
                          <span className="text-xs text-gray-500">{new Date(conv.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 truncate">{conv.prompt}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{conv.tokensUsed} tokens</span>
                          <span>${conv.cost.toFixed(4)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Model Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Comparação de Modelos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableModels.map((model) => (
                    <div
                      key={model.id}
                      className={`p-2 rounded border text-sm ${
                        model.id === config.selectedModel ? "bg-blue-50 border-blue-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{model.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {model.provider?.name || model.provider?.id || "Unknown"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {model.pricing.prompt} / {model.pricing.completion} per {model.pricing.unit} tokens
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
