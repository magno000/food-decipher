import { useEffect, useMemo, useState } from "react";
import ImageUploader from "@/components/analyzer/ImageUploader";
import GlycemicScore from "@/components/analyzer/Results/GlycemicScore";
import NutritionGrid from "@/components/analyzer/Results/NutritionGrid";
import DiabeticBadge from "@/components/analyzer/Results/DiabeticBadge";
import Recommendations from "@/components/analyzer/Results/Recommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResult } from "@/types/nutrition";
import { computeGL, isDiabeticFriendly } from "@/lib/gi";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Análisis Nutricional de Comida | Índice Glucémico";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Identifica tu comida con IA y obtiene calorías, macros, índice y carga glucémica, fibra, azúcares y recomendaciones.");
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Identifica tu comida con IA y obtiene calorías, macros, índice y carga glucémica, fibra, azúcares y recomendaciones.";
      document.head.appendChild(m);
    }
    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (link) link.href = window.location.href;
    else {
      const l = document.createElement("link");
      l.rel = "canonical";
      l.href = window.location.href;
      document.head.appendChild(l);
    }
  }, []);

  const handleSelect = (f: File, url: string) => {
    setFile(f);
    setPreview(url);
    setResult(null);
  };

  const onIdentify = async () => {
    if (!file) {
      toast({ title: "Sin imagen", description: "Por favor sube una imagen para analizar." });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      // Llamada real al backend (Supabase Edge Function + OpenAI Vision)
      const analyzed = await (await import("@/lib/api")).analyzeImageWithAI(file);

      // Completar datos derivados
      const gl = computeGL(analyzed.nutrition.glycemicIndex, analyzed.nutrition.carbs);
      analyzed.nutrition.glycemicLoad = gl;
      analyzed.nutrition.diabeticFriendly = isDiabeticFriendly(analyzed.nutrition);

      setResult(analyzed);
      toast({ title: "Análisis completado", description: "Se generó el análisis nutricional mediante IA." });
    } catch (err) {
      // Fallback: mantener la app funcional con un mock
      const mock: AnalysisResult = {
        name: "Plato identificado",
        totalWeightGrams: 350,
        imageUrl: preview || undefined,
        nutrition: {
          calories: 520,
          protein: 38,
          fat: 22,
          carbs: 40,
          fiber: 9,
          sugars: 8,
          addedSugars: 2,
          sodium: 620,
          glycemicIndex: 48,
          score: 82,
        },
        recommendations: [
          "Añade frutos secos para aumentar grasas saludables y saciedad.",
          "Evita aderezos con azúcares añadidos; prefiere aceite de oliva.",
          "Incluye pan integral si necesitas más carbohidratos de baja carga.",
        ],
        detailsText: "Valores estimados automáticamente. Ajusta porciones para tus necesidades.",
      };
      const gl = computeGL(mock.nutrition.glycemicIndex, mock.nutrition.carbs);
      mock.nutrition.glycemicLoad = gl;
      mock.nutrition.diabeticFriendly = isDiabeticFriendly(mock.nutrition);
      setResult(mock);
      toast({ title: "Servicio no disponible", description: "Usamos datos de ejemplo por ahora.", variant: "destructive" });
    } finally {
      setLoading(false);
    }

  };

  return (
    <main className="min-h-screen bg-background">
      <section className="container py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Identifica tu Comida y sus Valores Nutricionales</h1>
          <p className="mt-2 text-muted-foreground">Sube una imagen, pulsa "Identificar" y obtén calorías, macros, índice y carga glucémica.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <ImageUploader onSelected={handleSelect} />
            <Button onClick={onIdentify} disabled={!file || loading} className="w-full">
              {loading ? "Analizando..." : "Identificar"}
            </Button>
            {preview && (
              <Card>
                <CardHeader>
                  <CardTitle>Imagen seleccionada</CardTitle>
                  <CardDescription>Previsualización antes del análisis.</CardDescription>
                </CardHeader>
                <CardContent>
                  <img src={preview} alt="Imagen del plato para análisis nutricional" className="h-auto w-full rounded-md" loading="lazy" />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            {!result ? (
              <Card>
                <CardHeader>
                  <CardTitle>Resultados</CardTitle>
                  <CardDescription>Los resultados aparecerán aquí tras el análisis.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Sube una imagen y pulsa "Identificar" para ver el nombre del plato, información nutricional, índice y carga glucémica, y recomendaciones.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">{result.name}</h2>
                  <DiabeticBadge gi={result.nutrition.glycemicIndex} gl={result.nutrition.glycemicLoad} />
                </div>
                <GlycemicScore gi={result.nutrition.glycemicIndex} gl={result.nutrition.glycemicLoad} />
                <NutritionGrid data={result.nutrition} />
                <Recommendations tips={result.recommendations || []} />
                {result.detailsText && (
                  <Card>
                    <CardContent className="text-sm text-muted-foreground">
                      {result.detailsText}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
