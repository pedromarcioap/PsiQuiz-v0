"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ArrowLeft, Save, Sparkles } from "lucide-react"
import Link from "next/link"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "Básico" | "Intermediário" | "Avançado"
  topic: string
}

export default function CreateContentPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      difficulty: "Básico",
      topic: "",
    },
  ])
  const [useAI, setUseAI] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        difficulty: "Básico",
        topic: "",
      },
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setQuestions(updatedQuestions)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options[optionIndex] = value
    setQuestions(updatedQuestions)
  }

  const generateWithAI = async () => {
    // Simulação de geração com IA
    setUseAI(true)
    // Aqui seria integrada a IA para gerar questões baseadas no prompt
    console.log("Gerando questões com IA para:", aiPrompt)
  }

  const saveContent = () => {
    // Simulação de salvamento
    console.log("Salvando conteúdo:", { title, description, questions })
    alert("Conteúdo salvo com sucesso!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Plus className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Criar Conteúdo</h1>
          </div>
        </div>

        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título do Quiz</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Fundamentos da Psicologia Cognitiva"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o conteúdo e objetivos do quiz..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Generation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Geração com IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ai-prompt">Prompt para IA</Label>
              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Descreva o tópico e tipo de questões que deseja gerar. Ex: 'Crie 5 questões sobre teorias da personalidade, incluindo Freud, Jung e teorias contemporâneas'"
                rows={3}
              />
            </div>
            <Button onClick={generateWithAI} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Questões com IA
            </Button>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question, questionIndex) => (
            <Card key={questionIndex}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Questão {questionIndex + 1}</CardTitle>
                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Pergunta</Label>
                  <Textarea
                    value={question.question}
                    onChange={(e) => updateQuestion(questionIndex, "question", e.target.value)}
                    placeholder="Digite a pergunta..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tópico</Label>
                    <Input
                      value={question.topic}
                      onChange={(e) => updateQuestion(questionIndex, "topic", e.target.value)}
                      placeholder="Ex: Psicologia Cognitiva"
                    />
                  </div>
                  <div>
                    <Label>Dificuldade</Label>
                    <Select
                      value={question.difficulty}
                      onValueChange={(value) => updateQuestion(questionIndex, "difficulty", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Básico">Básico</SelectItem>
                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Alternativas</Label>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <Badge variant={question.correctAnswer === optionIndex ? "default" : "outline"}>
                          {String.fromCharCode(65 + optionIndex)}
                        </Badge>
                        <Input
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          placeholder={`Alternativa ${String.fromCharCode(65 + optionIndex)}`}
                          className="flex-1"
                        />
                        <Button
                          variant={question.correctAnswer === optionIndex ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateQuestion(questionIndex, "correctAnswer", optionIndex)}
                        >
                          {question.correctAnswer === optionIndex ? "Correta" : "Marcar"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Explicação</Label>
                  <Textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(questionIndex, "explanation", e.target.value)}
                    placeholder="Explique por que esta é a resposta correta..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <Button onClick={addQuestion} variant="outline" className="flex-1 bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Questão
          </Button>
          <Button onClick={saveContent} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Salvar Conteúdo
          </Button>
        </div>
      </div>
    </div>
  )
}
