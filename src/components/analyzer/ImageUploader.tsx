import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ImageUploaderProps {
  onSelected: (file: File, previewUrl: string) => void
}

export default function ImageUploader({ onSelected }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onSelected(file, url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sube una imagen</CardTitle>
        <CardDescription>Selecciona una foto del plato para analizar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
        <Button
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          className="w-full"
        >
          Elegir imagen
        </Button>
      </CardContent>
    </Card>
  )
}
