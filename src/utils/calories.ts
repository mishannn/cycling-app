export type Gender = 'male' | 'female';

export interface CalorieCalculationParams {
  gender: Gender;
  age: number;      // years
  weight: number;   // kg
  height: number;   // cm
  heartRate: number; // bpm
}

/**
 * Calculates calorie expenditure per minute during stationary cycling
 * 
 * Formula source: Keytel et al. (2005) "Prediction of energy expenditure 
 * from heart rate monitoring during submaximal exercise", J Sports Sci.
 * 
 * Methodology:
 * - Primary driver: Heart rate correlation with oxygen consumption (VO₂)
 * - Basal Metabolic Rate (BMR) added using Harris-Benedict equation
 * - Cadence intentionally excluded (contributes <3% variance in controlled studies)
 * 
 * Expected accuracy: ±15-25% without direct power measurement (watts)
 */
export function calculateCaloriesPerMinute(params: CalorieCalculationParams): number {
  const { gender, age, weight, height, heartRate } = params;

  // 1. Heart rate-based calorie calculation (kcal/min)
  let activeCalories: number;
  
  if (gender === 'male') {
    // Male formula: kcal/min = (-55.0969 + 0.6309*HR + 0.1988*weight + 0.2017*age) / 4.184
    activeCalories = (-55.0969 + 0.6309 * heartRate + 0.1988 * weight + 0.2017 * age) / 4.184;
  } else {
    // Female formula: kcal/min = (-20.4022 + 0.4472*HR + 0.1263*weight + 0.074*age) / 4.184
    activeCalories = (-20.4022 + 0.4472 * heartRate + 0.1263 * weight + 0.074 * age) / 4.184;
  }

  // 2. Basal Metabolic Rate (Harris-Benedict equation)
  const bmr = gender === 'male'
    ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  
  // BMR contribution per minute
  const bmrPerMinute = bmr / 1440;

  // 3. Total calories = active expenditure + basal metabolism
  const totalCalories = activeCalories + bmrPerMinute;

  // Safety bounds (physiological minimum during exercise ~1.5 kcal/min)
  return Math.max(1.5, Math.min(totalCalories, 30));
}