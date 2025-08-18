import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface Props {
  data: {
    calories: number
    protein: number
    fat: number
    carbs: number
    fiber?: number
    sugars?: number
    addedSugars?: number
    sodium?: number
    score?: number
  }
}

export default function NutritionGrid({ data }: Props) {
  const items = [
    { label: "Calorías", value: `${Math.round(data.calories)} kcal` },
    { label: "Proteínas", value: `${data.protein} g` },
    { label: "Grasas", value: `${data.fat} g` },
    { label: "Carbohidratos", value: `${data.carbs} g` },
    { label: "Fibra", value: data.fiber != null ? `${data.fiber} g` : "–" },
    { label: "Azúcares", value: data.sugars != null ? `${data.sugars} g` : "–" },
    { label: "Azúcares añadidos", value: data.addedSugars != null ? `${data.addedSugars} g` : "–" },
    { label: "Sodio", value: data.sodium != null ? `${data.sodium} mg` : "–" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información nutricional</CardTitle>
        <CardDescription>Valores estimados por porción/plato.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((it) => (
            <div key={it.label} className="rounded-md border bg-card p-3 text-sm">
              <div className="text-muted-foreground">{it.label}</div>
              <div className="font-semibold">{it.value}</div>
            </div>
          ))}
          {data.score != null && (
            <div className="col-span-2 md:col-span-4 rounded-md border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntuación de salud</span>
                <span className="font-semibold">{data.score} / 100</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(Math.max(data.score, 0), 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
