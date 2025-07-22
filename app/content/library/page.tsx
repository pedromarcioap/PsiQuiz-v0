"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LibraryPage() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aqui você encontrará todo o seu conteúdo de estudo.</p>
          {/* O conteúdo da biblioteca será adicionado aqui */}
        </CardContent>
      </Card>
    </div>
  )
}