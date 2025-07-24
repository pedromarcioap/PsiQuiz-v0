import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconType } from "react-icons"

type ReusableCardProps = {
  href: string
  icon: IconType
  iconColor: string
  backgroundColor: string
  title: string
  description: string
  extraContent?: React.ReactNode
}

export default function ReusableCard({ href, icon: Icon, iconColor, backgroundColor, title, description, extraContent }: ReusableCardProps) {
  return (
    <Link href={href}>
      <Card className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${backgroundColor}`}>
        <CardContent className="p-6 text-center">
          <Icon className={`h-12 w-12 ${iconColor} mx-auto mb-3`} />
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
          {extraContent}
        </CardContent>
      </Card>
    </Link>
  )
}