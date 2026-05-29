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
}
