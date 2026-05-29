export interface PackHistoryEntry {
  pack: number;
  new: number;
  repeated: number;
  unique_total: number;
  found_total: number;
}

export interface PredictiveDistribution {
  x: number[];
  pdf: number[];
  mean: number;
  sigma: number;
  target: number;
  prob_completion: number;
}

export interface Correlations {
  avg_new_per_pack: number;
  avg_repeated_per_pack: number;
  duplication_rate: number;
  corr_pack_vs_new: number;
}

export interface AppState {
  packs_opened: number;
  total_stickers_found: number;
  unique_stickers: number;
  repeated_stickers: number;
  total_album_size: number;
  probability_completion: number;
  gp_curve: {
    x: number[];
    y: number[];
    sigma: number[];
  };
  predictive_distribution: PredictiveDistribution;
  pack_history: PackHistoryEntry[];
  correlations: Correlations;
}
