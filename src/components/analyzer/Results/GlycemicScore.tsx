import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemedProgress } from "@/components/ui/themed-progress"
import { classifyGI, classifyGL } from "@/lib/gi"

interface Props {
  gi?: number
  gl?: number
}

export default function GlycemicScore({ gi, gl }: Props) {
  const giC = classifyGI(gi)
  const glC = classifyGL(gl)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Índice Glucémico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{gi ?? "–"}</span>
            <span className={giC.variant === "success" ? "text-success" : giC.variant === "warning" ? "text-warning" : "text-destructive"}>{giC.label}</span>
          </div>
          <ThemedProgress value={Math.min(Math.max(gi ?? 0, 0), 100)} variant={giC.variant} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Carga Glucémica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{gl ?? "–"}</span>
            <span className={glC.variant === "success" ? "text-success" : glC.variant === "warning" ? "text-warning" : "text-destructive"}>{glC.label}</span>
          </div>
          <ThemedProgress value={Math.min(Math.max(gl ?? 0, 0), 100)} variant={glC.variant} />
        </CardContent>
      </Card>
    </div>
  )
}
