import { AnalysisResult } from "@/types/nutrition";
import { supabase } from "@/integrations/supabase/client";

async function compressImageToDataUrl(file: File, maxSize = 1280, quality = 0.82): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
  const { width, height } = img;
  const scale = Math.min(1, maxSize / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, targetW, targetH);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function analyzeImageWithAI(file: File): Promise<AnalysisResult> {
  const imageDataUrl = await compressImageToDataUrl(file);

  const { data, error } = await supabase.functions.invoke("analyze-image", {
    body: { image: imageDataUrl },
  });

  if (error) {
    throw new Error(`Edge function error: ${error.message ?? "unknown"}`);
  }

  return data as AnalysisResult;
}
