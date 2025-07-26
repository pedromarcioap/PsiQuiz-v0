"use client"

import { memo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface LibraryItem {
  name: string
  icon: string
  count: number
}

interface ContentLibraryProps {
  items: LibraryItem[]
}

export function ContentLibrary({ items }: ContentLibraryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Biblioteca de Conteúdo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, index) => (
            <Link href="/content/library" key={index}>
              <Button variant="ghost" className="w-full justify-start text-sm">
                {item.icon} {item.name} ({item.count} docs)
              </Button>
            </Link>
          ))}
        </div>
        <Link href="/content/library">
          <Button className="w-full mt-4 bg-transparent" variant="outline">
            Ver Biblioteca Completa
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export const MemoizedContentLibrary = memo(ContentLibrary)
