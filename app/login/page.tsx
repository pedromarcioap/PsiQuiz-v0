"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Escolha seu método de login preferido</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={() => signIn("google")} className="w-full">
              Login com Google
            </Button>
            <Button onClick={() => signIn("microsoft")} className="w-full">
              Login com Outlook
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/register" className="underline">
              Registre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}