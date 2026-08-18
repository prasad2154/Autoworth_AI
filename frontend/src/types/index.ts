// AutoWorth AI — TypeScript Type Definitions

export interface User {
  id: number;
  full_name: string;
  email: string;
  profile_image?: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Compatibility aliases
  fullName?: string;
  profileImageUrl?: string;
  createdAt?: string;
  valuationsCount?: number;
}

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  fuel_type: string;
  transmission: string;
  engine_cc?: number;
  mileage?: number;
  seating_capacity?: number;
  created_at: string;
}

export interface SHAPFeature {
  feature: string;
  value: number;
  impact?: number;
  direction?: 'positive' | 'negative';
}

export interface PredictionRequest {
  brand: string;
  model: string;
  variant?: string;
  year: number;
  fuel_type: string;
  transmission: string;
  engine_cc?: number;
  mileage_kmpl?: number;
  seating_capacity?: number;
  km_driven: number;
  owner_count: number;
  condition_score: number;
  accident_history: boolean;
  service_history: boolean;
  city?: string;
  state?: string;
  [key: string]: any;
}

export interface DepreciationPoint {
  year: number;
  price: number;
  change_pct?: number;
}

export interface ComparableVehicle {
  id?: number;
  brand?: string;
  model?: string;
  title?: string;
  year?: number;
  km_driven?: number;
  price: number;
  deal_score?: number;
  score?: number;
  fuel_type?: string;
}

export interface PredictionResponse {
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
  market_average?: number;
  recommended_listing_price: number;
  deal_score: number;
  market_status: string;
  shap_features: SHAPFeature[];
  depreciation_curve: DepreciationPoint[];
  comparable_vehicles: ComparableVehicle[];
  ai_recommendation: string;
  model_version: string;
  valuation_id?: number;
  // Compatibility aliases
  id?: number;
  confidence_score?: number;
  recommended_listing?: number;
  depreciation_forecast?: DepreciationPoint[];
  feature_contributions?: Array<{ feature: string; value: number }>;
  comparables?: Array<{ id: number; title: string; price: number; score: number }>;
  price_range?: { min: number; max: number };
}

export interface ValuationHistory {
  id: number;
  km_driven: number;
  owner_count: number;
  condition_score: number;
  accident_history: boolean;
  service_history: boolean;
  city?: string;
  state?: string;
  predicted_price: number;
  lower_price: number;
  upper_price: number;
  confidence: number;
  market_average?: number;
  recommended_listing_price?: number;
  deal_score?: number;
  market_status?: string;
  model_version?: string;
  created_at: string;
  vehicle?: Vehicle;
  brand?: string;
  model?: string;
  year?: number;
  predictedPrice?: number;
  date?: string;
  dealScore?: number;
  marketStatus?: string;
}

export interface SavedCar {
  id: number;
  vehicle: Vehicle;
  created_at: string;
}

export interface PriceAlert {
  id: number;
  vehicle?: Vehicle;
  vehicleName?: string;
  target_price?: number;
  percentage_change?: number;
  alert_type?: string;
  type?: 'price_drop' | 'price_rise' | 'percentage_change';
  targetValue?: number;
  is_active: boolean;
  active?: boolean;
  created_at?: string;
}

export interface MarketSummary {
  total_listings: number;
  average_price: number;
  median_price: number;
  price_trend: number;
  most_popular_brand: string;
  most_popular_model: string;
  avg_km_driven: number;
  brand_distribution: Array<{ brand: string; count: number }>;
  fuel_distribution: Array<{ fuel_type: string; count: number }>;
  price_range_distribution: Array<{ range: string; count: number }>;
}

export interface AdminStats {
  total_users: number;
  total_valuations: number;
  total_vehicles: number;
  predictions_today: number;
  avg_predicted_value: number;
  most_valued_brand: string;
  most_popular_vehicle: string;
  active_model_version?: string;
  system_health: Record<string, any>;
}

export interface ModelVersion {
  id: number;
  model_name: string;
  version: string;
  algorithm: string;
  mae?: number;
  rmse?: number;
  r2_score?: number;
  mape?: number;
  training_records?: number;
  feature_count?: number;
  model_path?: string;
  is_active: boolean;
  trained_at: string;
}

export interface NegotiationResponse {
  assessment: string;
  suggested_offer: number;
  negotiation_tips?: string[];
  tips?: string[];
  walk_away_price: number;
  fair_range: { min: number; max: number };
  is_fair?: boolean;
  data?: any;
}

export interface SimulationScenario {
  km_driven?: number;
  owner_count?: number;
  condition_score?: number;
  year?: number;
  predicted_price?: number;
  lower_bound?: number;
  upper_bound?: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
  data?: T[];
}

export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid' | 'LPG';
export type TransmissionType = 'Manual' | 'Automatic' | 'AMT' | 'CVT' | 'DCT';
