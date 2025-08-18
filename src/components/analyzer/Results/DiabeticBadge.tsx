import { Badge } from "@/components/ui/badge"
import { classifyGI, classifyGL } from "@/lib/gi"

interface Props {
  gi?: number
  gl?: number
}

export default function DiabeticBadge({ gi, gl }: Props) {
  const giC = classifyGI(gi)
  const glC = classifyGL(gl)
  const ok = giC.variant === "success" && glC.variant === "success"

  return (
    <Badge variant={ok ? "default" : "destructive"} className={ok ? "bg-success text-success-foreground" : undefined}>
      {ok ? "Apto para diabéticos" : "Precaución diabéticos"}
    </Badge>
  )
}
