"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AIPersonalizedQuizPage() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Personalizado IA</CardTitle>
        </CardHeader>
        <CardContent>
          <p>A IA está analisando seu desempenho para criar um quiz sob medida para você.</p>
          {/* A lógica do quiz personalizado será adicionada aqui */}
          <Button className="mt-4">Iniciar Quiz</Button>
        </CardContent>
      </Card>
    </div>
  )
}