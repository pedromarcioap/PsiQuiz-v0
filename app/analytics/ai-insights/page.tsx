"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AIInsightsPage() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Insights da IA</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aqui você encontrará insights detalhados sobre seu progresso e áreas para melhorar.</p>
          {/* Os insights detalhados serão adicionados aqui */}
        </CardContent>
      </Card>
    </div>
  )
}