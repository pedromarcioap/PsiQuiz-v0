"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Brain, Zap, ArrowLeft, Settings, Target, Shuffle, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useStats } from "@/hooks/useStats"
import { aiService } from "@/lib/ai-service"

interface GeneratedQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "Básico" | "Intermediário" | "Avançado"
  topic: string
  distractorQuality: number
  userFeedback?: "good" | "poor" | null
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

export default function AIGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const { addQuizResult } = useStats() // Changed from registerQuiz to addQuizResult
  const { toast } = useToast()

  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)

  const [config, setConfig] = useState({
    topic: "",
    subtopics: "",
    questionCount: 10,
    difficulty: "mixed",
    distractorComplexity: 80,
    useAdversarialTraining: true,
    includeWebSearch: false,
    selectedModel: "openai/gpt-4o-mini", // Added selectedModel to config
    focusAreas: [] as string[],
  })

  const [systemPrompt, setSystemPrompt] =
    useState(`Você é um especialista em Psicologia com PhD e 20 anos de experiência em ensino universitário. Crie questões de múltipla escolha sofisticadas que testem compreensão profunda, não memorização.

ESTRATÉGIAS PARA DISTRATORES DE ALTA QUALIDADE:
1. INVERSÃO DE CONCEITOS: Use conceitos verdadeiros aplicados incorretamente
2. INFORMAÇÃO PARCIAL: Respostas tecnicamente corretas mas incompletas
3. TERMINOLOGIA CRUZADA: Misture termos de diferentes áreas da psicologia
4. OPINIÕES DISFARÇADAS: Apresente opiniões como se fossem fatos científicos
5. GENERALIZAÇÕES: Transforme casos específicos em regras gerais
6. SIMPLIFICAÇÕES: Reduza conceitos complexos de forma enganosa

PADRÕES DE VERBOS (varie sempre):
- Analise, Compare, Identifique, Determine, Explique, Avalie, Diferencie, Classifique

NÍVEIS DE COMPLEXIDADE:
- Básico: Definições e conceitos fundamentais
- Intermediário: Aplicação e análise
- Avançado: Síntese e avaliação crítica`)

  useEffect(() => {
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
        ]) // Cast to OpenRouterModel
      } finally {
        setIsLoadingModels(false)
      }
    }
    fetchModels()
  }, [])

  const handleGenerate = async () => {
    if (!config.topic) {
      toast({
        title: "Erro",
        description: "Por favor, insira um tópico para gerar o quiz.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedQuestions([])

    try {
      const response = await aiService.generateQuestions({
        topic: config.topic,
        subtopics: config.subtopics,
        questionCount: config.questionCount,
        difficulty: config.difficulty,
        distractorComplexity: config.distractorComplexity / 100,
        useAdversarialTraining: config.useAdversarialTraining,
        includeWebSearch: config.includeWebSearch,
        systemPrompt: systemPrompt,
        selectedModel: config.selectedModel, // Pass selected model
      })

      if (response && response.questions) {
        setGeneratedQuestions(response.questions as GeneratedQuestion[])
        toast({
          title: "Sucesso",
          description: "Quiz gerado com sucesso!",
        })
      } else {
        toast({
          title: "Erro",
          description: "Falha ao gerar o quiz. Por favor, tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Erro ao gerar questões:", error)
      toast({
        title: "Erro",
        description: error?.message || "Ocorreu um erro ao gerar o quiz.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setGenerationProgress(100)
    }
  }

  const handleFeedback = async (questionId: string, feedback: "good" | "poor") => {
    setGeneratedQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, userFeedback: feedback } : q)))

    try {
      await aiService.provideFeedback(questionId, feedback)
      toast({
        title: "Feedback Enviado",
        description: "Obrigado pelo seu feedback!",
      })
    } catch (error) {
      console.error("Erro ao enviar feedback:", error)
      toast({
        title: "Erro",
        description: "Falha ao enviar o feedback. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleStartQuiz = () => {
    if (generatedQuestions.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, gere um quiz antes de iniciar.",
        variant: "destructive",
      })
      return
    }

    const quizData = {
      title: config.topic || "Quiz Gerado por IA",
      questions: generatedQuestions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation, // Include explanation for study mode
        difficulty: q.difficulty,
        topic: q.topic,
      })),
    }

    addQuizResult({
      title: quizData.title,
      score: 0, // Initial score, will be updated in study mode
      totalQuestions: quizData.questions.length,
      correctAnswers: 0, // Initial correct answers
      timeSpent: 0, // Initial time spent
      difficulty: config.difficulty,
      mode: "study",
    })

    // Store questions in localStorage to be retrieved by study-mode
    localStorage.setItem("currentQuizQuestions", JSON.stringify(quizData.questions))

    // Redirect to study mode page
    window.location.href = "/quiz/study-mode"
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Básico":
        return "bg-green-100 text-green-800"
      case "Intermediário":
        return "bg-yellow-100 text-yellow-800"
      case "Avançado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Zap className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Gerador de Quiz IA</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="topic">Tópico Principal</Label>
                  <Input
                    id="topic"
                    placeholder="Ex: Neuropsicologia Cognitiva"
                    value={config.topic}
                    onChange={(e) => setConfig((prev) => ({ ...prev, topic: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="subtopics">Subtópicos (opcional)</Label>
                  <Textarea
                    id="subtopics"
                    placeholder="Ex: memória de trabalho, atenção seletiva, funções executivas"
                    value={config.subtopics}
                    onChange={(e) => setConfig((prev) => ({ ...prev, subtopics: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Número de Questões: {config.questionCount}</Label>
                  <Slider
                    value={[config.questionCount]}
                    onValueChange={([value]) => setConfig((prev) => ({ ...prev, questionCount: value }))}
                    max={50}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Nível de Dificuldade</Label>
                  <Select
                    value={config.difficulty}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                      <SelectItem value="mixed">Misto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Complexidade dos Distratores: {config.distractorComplexity}%</Label>
                  <Slider
                    value={[config.distractorComplexity]}
                    onValueChange={([value]) => setConfig((prev) => ({ ...prev, distractorComplexity: value }))}
                    max={100}
                    min={50}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maior = distratores mais convincentes e difíceis</p>
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
                              {model.provider?.name ?? model.provider}
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

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Treinamento Adversarial (GAN)</Label>
                    <Switch
                      checked={config.useAdversarialTraining}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, useAdversarialTraining: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Busca Web Automática</Label>
                    <Switch
                      checked={config.includeWebSearch}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, includeWebSearch: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={8}
                  className="text-xs"
                />
              </CardContent>
            </Card>

            <Button onClick={handleGenerate} disabled={isGenerating || !config.topic} className="w-full" size="lg">
              {isGenerating ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Gerando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Gerar Quiz IA
                </>
              )}
            </Button>
          </div>

          {/* Generation Progress & Results */}
          <div className="lg:col-span-2 space-y-6">
            {isGenerating && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 animate-pulse" />
                    Processamento IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Analisando conteúdo e gerando questões...</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-3" />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Processamento de linguagem natural</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span>Geração de distratores GAN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Validação de qualidade</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span>Otimização final</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {generatedQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Questões Geradas ({generatedQuestions.length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Shuffle className="h-4 w-4 mr-2" />
                        Regenerar
                      </Button>
                      <Button size="sm" onClick={handleStartQuiz}>
                        Iniciar Quiz
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {generatedQuestions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                            <Badge variant="outline">{question.topic}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">{question.distractorQuality}%</span>
                            </div>
                          </div>
                        </div>

                        <h3 className="font-medium mb-3">{question.question}</h3>

                        <div className="space-y-2 mb-4">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-2 rounded border ${
                                optionIndex === question.correctAnswer
                                  ? "bg-green-50 border-green-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant={optionIndex === question.correctAnswer ? "default" : "outline"}>
                                  {String.fromCharCode(65 + optionIndex)}
                                </Badge>
                                <span className="text-sm">{option}</span>
                                {optionIndex === question.correctAnswer && (
                                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-800 mb-1">Explicação:</p>
                              <p className="text-sm text-blue-700">{question.explanation}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Qualidade dos distratores: {question.distractorQuality}%
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant={question.userFeedback === "good" ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleFeedback(question.id, "good")}
                            >
                              👍 Boa
                            </Button>
                            <Button
                              variant={question.userFeedback === "poor" ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => handleFeedback(question.id, "poor")}
                            >
                              👎 Ruim
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {generatedQuestions.length === 0 && !isGenerating && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Pronto para Gerar Quiz</h3>
                  <p className="text-gray-500 mb-4">Configure os parâmetros à esquerda e clique em "Gerar Quiz IA"</p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Distratores GAN</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>Alta Qualidade</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <span>IA Avançada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>Geração Rápida</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
