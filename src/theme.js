import { Platform } from "react-native";

export const C = {
  bg: "#080808",
  surface: "#131313",
  surface2: "#1b1b1b",
  border: "#262626",
  text: "#ffffff",
  muted: "#9a9a9a",
  dim: "#6b6b6b",
  accent: "#d45c35",
  accentSoft: "rgba(212,92,53,0.16)",
  success: "#3ecf8e",
};

export const LOGO =
  "https://res.cloudinary.com/hxozockw/image/upload/v1791310480/7b56ea77-1551-4a5b-9a5d-a58fcdb4511a_we3gny.png";
export const BANNER =
  "https://res.cloudinary.com/hxozockw/image/upload/v1791310492/QORmH_mzga1i.jpg";

export const FREE_SHIPPING_FROM = 500;

export const MAX_W = 600;

export const ND = Platform.OS !== "web";

export const money = (value) =>
  `R$ ${Number(value || 0).toFixed(2).replace(".", ",")}`;

export const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
