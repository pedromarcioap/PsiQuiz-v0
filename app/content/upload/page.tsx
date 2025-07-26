"use client"

export const dynamic = "force-dynamic" // ⬅ keeps this page out of static rendering
export const prerender = false // ⬅ extra safety for Next 15+

import { useCallback, useState } from "react"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Brain, CheckCircle, FileText, Globe, Link2, Upload, Settings, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { aiService } from "@/lib/ai-service"
import { useStats } from "@/hooks/useStats"

type ContentType = "pdf" | "text" | "url" | "web-search"
type StatusType = "uploading" | "processing" | "completed" | "error"
type Difficulty = "basic" | "intermediate" | "advanced" | "mixed"
type DistractorQuality = "standard" | "high" | "expert"

interface ContentItem {
  id: string
  name: string
  type: ContentType
  size?: string
  status: StatusType
  progress: number
  questionsGenerated?: number
}

/* ────────────────────────────── */
/* 🔧  Small pure helper functions */
/* ────────────────────────────── */
function getTypeIcon(type: ContentType) {
  switch (type) {
    case "pdf":
      return <FileText className="h-4 w-4 text-red-600" />
    case "url":
      return <Link2 className="h-4 w-4 text-blue-600" />
    case "web-search":
      return <Globe className="h-4 w-4 text-green-600" />
    default:
      return <FileText className="h-4 w-4 text-gray-600" />
  }
}

function getStatusIcon(status: StatusType) {
  if (status === "completed") return <CheckCircle className="h-5 w-5 text-green-600" />
  if (status === "error") return <AlertCircle className="h-5 w-5 text-red-600" />
  return <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
}

export default function UploadContentPage() {
  /* -------------------------------------- */
  /* 🗃️  State & hooks                      */
  /* -------------------------------------- */
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [systemPrompt, setSystemPrompt] = useState(
    `Você é um especialista em Psicologia criando questões de múltipla escolha para estudantes universitários. 

INSTRUÇÕES PARA GERAÇÃO DE QUESTÕES:
1. Crie questões que testem compreensão conceitual, não memorização
2. Use distratores plausíveis:
   - Conceitos relacionados, mas incorretos
   - Inversões de conceitos verdadeiros
   - Informações parciais
   - Terminologia de outras áreas
   - Generalizações excessivas
3. Varie verbos (analise, compare, identifique…)
4. Misture níveis (básico, intermediário, avançado)
5. Traga explicações detalhadas

FORMATO:
- pergunta
- 4 alternativas (A-D)
- índice da correta
- explicação
- dificuldade
- tópico`,
  )

  const [webSearchQuery, setWebSearchQuery] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [numQuestions, setNumQuestions] = useState("10")
  const [difficulty, setDifficulty] = useState<Difficulty>("mixed")
  const [distractorQuality, setDistractorQuality] = useState<DistractorQuality>("high")

  const { toast } = useToast()
  const { incrementContentsProcessed, incrementQuestionsGenerated } = useStats()

  /**
   * Processes the raw text of a content item, generates questions using the AI service,
   * and creates a new quiz in the database.
   * @param item The content item being processed.
   * @param rawText The raw text of the content item.
   * @param contentId The ID of the content item in the database.
   */
  const processContent = useCallback(
    async (item: ContentItem, rawText: string, contentId: string) => {
      setContentItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "processing", progress: 0 } : i)))

      try {
        const questions = await aiService.generateQuestions(
          rawText,
          systemPrompt,
          Number.parseInt(numQuestions, 10),
          difficulty,
          distractorQuality,
        )

        if (!questions?.length) throw new Error("A IA não gerou questões.")

        await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Quiz for ${item.name}`,
            contentId,
            questions,
          }),
        })

        setContentItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "completed", progress: 100, questionsGenerated: questions.length } : i,
          ),
        )
        incrementContentsProcessed()
        incrementQuestionsGenerated(questions.length)
        toast({ title: "Sucesso!", description: `${questions.length} questões geradas.` })
      } catch (err: any) {
        console.error(err)
        setContentItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i)))
        toast({
          title: "Erro ao gerar questões",
          description: err?.message ?? "Falha desconhecida.",
          variant: "destructive",
        })
      }
    },
    [
      systemPrompt,
      numQuestions,
      difficulty,
      distractorQuality,
      toast,
      incrementContentsProcessed,
      incrementQuestionsGenerated,
    ],
  )

  /**
   * Handles the file upload process. Creates a new content entry in the database
   * and then processes the file content.
   * @param files The files to be uploaded.
   */
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files) return
      for (const file of Array.from(files)) {
        const item: ContentItem = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type === "application/pdf" ? "pdf" : "text",
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          status: "uploading",
          progress: 0,
        }
        setContentItems((p) => [...p, item])

        try {
          const response = await fetch("/api/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: file.name,
              type: item.type,
              source: file.name,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to create content entry")
          }

          const newContent = await response.json()
          const text = await file.text()
          processContent(item, text, newContent.id)
        } catch (error) {
          console.error("Error during file upload process:", error)
          setContentItems((p) => p.map((i) => (i.id === item.id ? { ...i, status: "error" } : i)))
          toast({
            title: "Erro ao enviar arquivo",
            description: "Não foi possível salvar o arquivo no sistema. Tente novamente.",
            variant: "destructive",
          })
        }
      }
    },
    [processContent, toast],
  )

  /**
   * Handles the URL submission process. Creates a new content entry in the database,
   * extracts the text from the URL, and then processes the content.
   */
  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) return
    const item: ContentItem = {
      id: crypto.randomUUID(),
      name: urlInput,
      type: "url",
      status: "uploading",
      progress: 0,
    }
    setContentItems((p) => [...p, item])

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: urlInput,
          type: "url",
          source: urlInput,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create content entry")
      }
      const newContent = await response.json()

      const res = await fetch(`/api/extract-url?url=${encodeURIComponent(urlInput)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { text } = await res.json()
      if (!text) throw new Error("Nada foi extraído da URL.")
      processContent(item, text, newContent.id)
    } catch (err: any) {
      console.error(err)
      setContentItems((p) => p.map((i) => (i.id === item.id ? { ...i, status: "error" } : i)))
      toast({
        title: "Erro ao processar URL",
        description: "Não foi possível extrair o conteúdo da URL. Verifique se a URL está correta e tente novamente.",
        variant: "destructive",
      })
    }
    setUrlInput("")
  }, [urlInput, processContent, toast])

  /**
   * Handles the web search process. Creates a new content entry in the database,
   * performs a web search, and then processes the search results.
   */
  const handleWebSearch = useCallback(async () => {
    if (!webSearchQuery.trim()) return
    const item: ContentItem = {
      id: crypto.randomUUID(),
      name: `Busca: "${webSearchQuery}"`,
      type: "web-search",
      status: "uploading",
      progress: 0,
    }
    setContentItems((p) => [...p, item])

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Busca: "${webSearchQuery}"`,
          type: "web-search",
          source: webSearchQuery,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create content entry")
      }
      const newContent = await response.json()

      const res = await fetch(`/api/web-search?query=${encodeURIComponent(webSearchQuery)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { results } = await res.json()
      if (!results?.length) throw new Error("Nenhum resultado encontrado.")
      processContent(
        item,
        results
          .map((r: { text: string }) => r.text)
          .filter(Boolean)
          .join("\n"),
        newContent.id,
      )
    } catch (err: any) {
      console.error(err)
      setContentItems((p) => p.map((i) => (i.id === item.id ? { ...i, status: "error" } : i)))
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar o conteúdo da web. Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
    setWebSearchQuery("")
  }, [webSearchQuery, processContent, toast])

  /* -------------------------------------- */
  /* 📄  JSX                               */
  /* -------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
            </Link>
            <Upload className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Upload de Conteúdo</h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT – Upload methods */}
          <div className="space-y-6 lg:col-span-2">
            {/* File upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Upload de Arquivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-indigo-400"
                  onDrop={(e) => {
                    e.preventDefault()
                    handleFileUpload(e.dataTransfer.files)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-lg font-medium text-gray-700">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-gray-500">PDF, TXT ou DOCX (máx. 50 MB)</p>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.txt,.docx"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* URL input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" /> Adicionar Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://exemplo.com/artigo..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                  />
                  <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Web search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" /> Busca na Internet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: neuroplasticidade psicologia cognitiva 2024"
                    value={webSearchQuery}
                    onChange={(e) => setWebSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleWebSearch()}
                  />
                  <Button onClick={handleWebSearch} disabled={!webSearchQuery.trim()}>
                    <Globe className="mr-2 h-4 w-4" /> Buscar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Processing status */}
            {contentItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Status do Processamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentItems.map((item) => (
                      <div key={item.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span className="max-w-md truncate font-medium">{item.name}</span>
                            {item.size && <Badge variant="outline">{item.size}</Badge>}
                          </div>
                          {getStatusIcon(item.status)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              {
                                {
                                  uploading: "Enviando...",
                                  processing: "Processando com IA...",
                                  completed: "Concluído",
                                  error: "Erro",
                                }[item.status]
                              }
                            </span>
                            <span>{Math.round(item.progress)}%</span>
                          </div>
                          <Progress value={item.progress} className="h-2" />

                          {item.status === "completed" && item.questionsGenerated && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>{item.questionsGenerated} questões geradas</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT – Prompt & IA settings */}
          <div className="space-y-6">
            {/* System prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" /> System Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label htmlFor="systemPrompt">Instruções para IA</Label>
                  <Textarea
                    id="systemPrompt"
                    rows={12}
                    className="text-sm"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI params */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" /> Configurações IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Número de Questões</Label>
                  <Select value={numQuestions} onValueChange={setNumQuestions}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["5", "10", "15", "20"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v} questões
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Dificuldade</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        ["basic", "Básico"],
                        ["intermediate", "Intermediário"],
                        ["advanced", "Avançado"],
                        ["mixed", "Misto"],
                      ].map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Qualidade dos Distratores</Label>
                  <Select value={distractorQuality} onValueChange={setDistractorQuality}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        ["standard", "Padrão"],
                        ["high", "Alta"],
                        ["expert", "Especialista"],
                      ].map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Quick stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Conteúdos Processados</span>
                  <span className="font-semibold">{contentItems.filter((i) => i.status === "completed").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Questões Geradas</span>
                  <span className="font-semibold">
                    {contentItems.reduce((sum, i) => sum + (i.questionsGenerated ?? 0), 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
