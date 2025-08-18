export type GlycemicLevel = "low" | "medium" | "high"

export interface NutritionInfo {
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber?: number
  sugars?: number
  addedSugars?: number
  sodium?: number
  score?: number // 0-100 health score
  glycemicIndex?: number
  glycemicLoad?: number
  level?: GlycemicLevel
  diabeticFriendly?: boolean
}

export interface AnalysisResult {
  name: string
  totalWeightGrams?: number
  imageUrl?: string
  nutrition: NutritionInfo
  recommendations?: string[]
  detailsText?: string
}
