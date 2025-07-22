"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, PlusCircle } from "lucide-react"
import Link from "next/link"

export default function LibraryPage() {
  const content = [
    { id: 1, title: "Neuropsicologia Cognitiva.pdf", date: "2024-01-15" },
    { id: 2, title: "Artigo sobre Psicologia Social", date: "2024-01-13" },
  ]

  return (
    <div className="p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Biblioteca de Conteúdo</CardTitle>
          <Link href="/content/upload">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Conteúdo
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>{item.title}</span>
                </div>
                <span className="text-sm text-gray-500">{item.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}