import { AnalysisResult } from "@/types/nutrition";
import { supabase } from "@/integrations/supabase/client";

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

  const { data, error } = await supabase.functions.invoke("analyze-image", {
    body: { image: imageDataUrl },
  });

  if (error) {
    throw new Error(`Edge function error: ${error.message ?? "unknown"}`);
  }

  return data as AnalysisResult;
}
