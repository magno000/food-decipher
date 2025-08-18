import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  tips: string[]
}

export default function Recommendations({ tips }: Props) {
  if (!tips?.length) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recomendaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          {tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
