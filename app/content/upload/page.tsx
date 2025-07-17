"use client"

export const dynamic = "force-dynamic"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Link2, Globe, Brain, ArrowLeft, CheckCircle, AlertCircle, Settings, Zap } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { aiService } from "@/services/aiService"
import { useStats } from "@/hooks/useStats"

interface ContentItem {
  id: string
  name: string
  type: "pdf" | "text" | "url" | "web-search"
  size?: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  questionsGenerated?: number
}

export default function UploadContentPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [systemPrompt, setSystemPrompt] =
    useState(`Você é um especialista em Psicologia criando questões de múltipla escolha para estudantes universitários. 

INSTRUÇÕES PARA GERAÇÃO DE QUESTÕES:
1. Crie questões que testem compreensão conceitual, não memorização
2. Use distratores plausíveis baseados em:
   - Conceitos relacionados mas incorretos
   - Inversões de conceitos verdadeiros
   - Informações parciais ou incompletas
   - Terminologia de outras áreas da psicologia
   - Generalizações excessivas
   
3. Varie os verbos nas perguntas: analise, compare, identifique, explique, determine
4. Inclua questões de diferentes níveis: básico, intermediário, avançado
5. Forneça explicações detalhadas para cada resposta correta

FORMATO DE SAÍDA:
- Pergunta clara e específica
- 4 alternativas (A, B, C, D)
- Indicação da resposta correta
- Explicação detalhada
- Nível de dificuldade
- Tópico/área da psicologia`)

  const [webSearchQuery, setWebSearchQuery] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const { incrementContentsProcessed, incrementQuestionsGenerated } = useStats()
  const [numQuestions, setNumQuestions] = useState("10")
  const [difficulty, setDifficulty] = useState("mixed")
  const [distractorQuality, setDistractorQuality] = useState("high")

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files) return

      Array.from(files).forEach(async (file) => {
        const newItem: ContentItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type === "application/pdf" ? "pdf" : "text",
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          status: "uploading",
          progress: 0,
        }

        setContentItems((prev) => [...prev, newItem])

        try {
          const fileContent = await file.text()
          processContent(newItem, fileContent)
        } catch (error) {
          console.error("Error reading file:", error)
          setContentItems((prev) => prev.map((item) => (item.id === newItem.id ? { ...item, status: "error" } : item)))
          toast({
            title: "Erro ao ler o arquivo",
            description: "Não foi possível ler o conteúdo do arquivo.",
            variant: "destructive",
          })
        }
      })
    },
    [processContent, toast],
  )

  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) return

    const newItem: ContentItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: urlInput,
      type: "url",
      status: "uploading",
      progress: 0,
    }

    setContentItems((prev) => [...prev, newItem])

    try {
      const response = await fetch(`/api/extract-url?url=${encodeURIComponent(urlInput)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.text) {
        processContent(newItem, data.text)
      } else {
        throw new Error("No text extracted from URL")
      }
    } catch (error: any) {
      console.error("Error processing URL:", error)
      setContentItems((prev) => prev.map((item) => (item.id === newItem.id ? { ...item, status: "error" } : item)))
      toast({
        title: "Erro ao processar a URL",
        description: error.message || "Não foi possível extrair o conteúdo da URL.",
        variant: "destructive",
      })
    }
    setUrlInput("")
  }, [processContent, toast, urlInput])

  const handleWebSearch = useCallback(async () => {
    if (!webSearchQuery.trim()) return

    const newItem: ContentItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Busca: "${webSearchQuery}"`,
      type: "web-search",
      status: "uploading",
      progress: 0,
    }

    setContentItems((prev) => [...prev, newItem])

    try {
      const response = await fetch(`/api/web-search?query=${encodeURIComponent(webSearchQuery)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        // Concatenate the text from all search results
        const searchText = data.results.map((result: any) => result.text).join("\n")
        processContent(newItem, searchText)
      } else {
        throw new Error("No results found for the web search query")
      }
    } catch (error: any) {
      console.error("Error processing web search:", error)
      setContentItems((prev) => prev.map((item) => (item.id === newItem.id ? { ...item, status: "error" } : item)))
      toast({
        title: "Erro ao processar a busca na internet",
        description: error.message || "Não foi possível obter resultados da busca.",
        variant: "destructive",
      })
    }
    setWebSearchQuery("")
  }, [processContent, toast, webSearchQuery])

  const processContent = useCallback(
    async (item: ContentItem, content: string) => {
      setContentItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "processing", progress: 0 } : i)))

      try {
        const result = await aiService.generateQuestions(
          content,
          systemPrompt,
          Number.parseInt(numQuestions),
          difficulty,
          distractorQuality,
        )

        if (result && result.length > 0) {
          setContentItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, status: "completed", progress: 100, questionsGenerated: result.length } : i,
            ),
          )
          incrementContentsProcessed()
          incrementQuestionsGenerated(result.length)
          toast({
            title: "Conteúdo processado com sucesso!",
            description: `${result.length} questões geradas.`,
          })
        } else {
          throw new Error("No questions were generated.")
        }
      } catch (error: any) {
        console.error("Error generating questions:", error)
        setContentItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i)))
        toast({
          title: "Erro ao gerar questões",
          description: error.message || "Ocorreu um erro ao gerar as questões.",
          variant: "destructive",
        })
      }
    },
    [
      systemPrompt,
      toast,
      incrementContentsProcessed,
      incrementQuestionsGenerated,
      numQuestions,
      difficulty,
      distractorQuality,
    ],
  )

  const getStatusIcon = (status: ContentItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
    }
  }

  const getTypeIcon = (type: ContentItem["type"]) => {
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
            <Upload className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Upload de Conteúdo</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Upload de Arquivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                  onDrop={(e) => {
                    e.preventDefault()
                    handleFileUpload(e.dataTransfer.files)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-gray-500">Suporta PDF, TXT, DOCX (máx. 50MB cada)</p>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf,.txt,.docx"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* URL Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Adicionar Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://exemplo.com/artigo-psicologia"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
                  />
                  <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                    Adicionar
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Artigos, papers, páginas web com conteúdo de Psicologia</p>
              </CardContent>
            </Card>

            {/* Web Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Busca na Internet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: neuroplasticidade psicologia cognitiva 2024"
                    value={webSearchQuery}
                    onChange={(e) => setWebSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleWebSearch()}
                  />
                  <Button onClick={handleWebSearch} disabled={!webSearchQuery.trim()}>
                    <Globe className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Busca conteúdo atualizado e contextualizado automaticamente
                </p>
              </CardContent>
            </Card>

            {/* Content Processing Status */}
            {contentItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Status do Processamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentItems.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span className="font-medium truncate max-w-md">{item.name}</span>
                            {item.size && <Badge variant="outline">{item.size}</Badge>}
                          </div>
                          {getStatusIcon(item.status)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              {item.status === "uploading"
                                ? "Enviando..."
                                : item.status === "processing"
                                  ? "Processando com IA..."
                                  : item.status === "completed"
                                    ? "Concluído"
                                    : "Erro"}
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

          {/* System Prompt Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="system-prompt">Instruções para IA</Label>
                    <Textarea
                      id="system-prompt"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      rows={12}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Templates Predefinidos</Label>
                    <div className="space-y-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs bg-transparent"
                        onClick={() => setSystemPrompt("Template para questões básicas de Psicologia...")}
                      >
                        Psicologia Básica
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs bg-transparent"
                        onClick={() => setSystemPrompt("Template para neuropsicologia avançada...")}
                      >
                        Neuropsicologia
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs bg-transparent"
                        onClick={() => setSystemPrompt("Template para psicologia clínica...")}
                      >
                        Psicologia Clínica
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Configurações IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Número de Questões por Conteúdo</Label>
                    <Select defaultValue={numQuestions} onValueChange={setNumQuestions}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 questões</SelectItem>
                        <SelectItem value="10">10 questões</SelectItem>
                        <SelectItem value="15">15 questões</SelectItem>
                        <SelectItem value="20">20 questões</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Nível de Dificuldade</Label>
                    <Select defaultValue={difficulty} onValueChange={setDifficulty}>
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
                    <Label>Qualidade dos Distratores</Label>
                    <Select defaultValue={distractorQuality} onValueChange={setDistractorQuality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Padrão</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="expert">Especialista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Conteúdos Processados</span>
                    <span className="font-semibold">{contentItems.filter((i) => i.status === "completed").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Questões Geradas</span>
                    <span className="font-semibold">
                      {contentItems.reduce((acc, item) => acc + (item.questionsGenerated || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa de Sucesso</span>
                    <span className="font-semibold text-green-600">98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
