"use client"

import { memo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Zap, TrendingUp } from "lucide-react"

export const QuickActions = memo(() => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Link href="/content/upload">
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-dashed border-indigo-200 hover:border-indigo-400">
          <CardContent className="p-6 text-center">
            <Upload className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Upload Conteúdo</h3>
            <p className="text-sm text-gray-600">PDFs, links, arquivos de texto</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/quiz/ai-generator">
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-6 text-center">
            <Zap className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Gerar Quiz IA</h3>
            <p className="text-sm text-gray-600">Criação automática inteligente</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/analytics/performance">
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Análise IA</h3>
            <p className="text-sm text-gray-600">Performance e recomendações</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
})
