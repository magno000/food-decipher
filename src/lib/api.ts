import { AnalysisResult } from "@/types/nutrition";

async function fileToDataUrl(file: File): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return dataUrl;
}

export async function analyzeImageWithAI(file: File): Promise<AnalysisResult> {
  const imageDataUrl = await fileToDataUrl(file);

  const res = await fetch("/functions/v1/analyze-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageDataUrl }),
  });

  if (!res.ok) {
    throw new Error(`Edge function error: ${res.status}`);
  }

  const data = (await res.json()) as AnalysisResult;
  return data;
}
