import { GlycemicLevel, NutritionInfo } from "@/types/nutrition"

export function classifyGI(gi?: number): { level: GlycemicLevel; label: string; variant: "success" | "warning" | "destructive" } {
  if (gi == null) return { level: "medium", label: "Desconocido", variant: "warning" }
  if (gi < 55) return { level: "low", label: "Bajo (<55)", variant: "success" }
  if (gi <= 70) return { level: "medium", label: "Medio (55-70)", variant: "warning" }
  return { level: "high", label: "Alto (>70)", variant: "destructive" }
}

export function computeGL(gi?: number, carbs?: number): number | undefined {
  if (gi == null || carbs == null) return undefined
  return Math.round(((gi * carbs) / 100) * 10) / 10
}

export function classifyGL(gl?: number): { label: string; variant: "success" | "warning" | "destructive" } {
  if (gl == null) return { label: "Desconocido", variant: "warning" }
  if (gl < 10) return { label: "Baja (<10)", variant: "success" }
  if (gl <= 20) return { label: "Media (10-20)", variant: "warning" }
  return { label: "Alta (>20)", variant: "destructive" }
}

export function isDiabeticFriendly(n: NutritionInfo): boolean {
  const giOk = (n.glycemicIndex ?? 100) < 55
  const glOk = (n.glycemicLoad ?? computeGL(n.glycemicIndex, n.carbs) ?? 100) < 10
  const fiberOk = (n.fiber ?? 0) >= 5
  const addedSugarsOk = (n.addedSugars ?? 0) <= 5
  return giOk && glOk && fiberOk && addedSugarsOk
}
