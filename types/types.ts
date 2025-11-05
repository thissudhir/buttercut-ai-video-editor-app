export interface Overlay {
  id: string;
  type: "text" | "image" | "video";
  content: string;
  x: number;
  y: number;
  start_time: number;
  end_time: number;
}
