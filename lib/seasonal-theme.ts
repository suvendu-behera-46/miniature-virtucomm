import prisma from "@/lib/prisma";

export const SEASONAL_THEME_KEY = "seasonal_theme";

export type SeasonalTheme = {
  enabled: boolean;
  title: string;
  subtitle: string;
  startsAt: string;
  endsAt: string;
  accentColor: string;
  overlayOpacity: number;
  images: Array<{ src: string; alt: string }>;
};

export const DEFAULT_SEASONAL_THEME: SeasonalTheme = {
  enabled: false,
  title: "",
  subtitle: "",
  startsAt: "",
  endsAt: "",
  accentColor: "#0e7490",
  overlayOpacity: 55,
  images: [],
};

export function normalizeSeasonalTheme(value: unknown): SeasonalTheme {
  if (!value || typeof value !== "object") return DEFAULT_SEASONAL_THEME;

  const source = value as Partial<SeasonalTheme>;
  const images = Array.isArray(source.images)
    ? source.images.flatMap((image) => {
        if (!image || typeof image !== "object") return [];
        const item = image as { src?: unknown; alt?: unknown };
        if (typeof item.src !== "string" || !isAllowedThemeImage(item.src)) return [];
        return [{ src: item.src, alt: typeof item.alt === "string" ? item.alt.slice(0, 160) : "Seasonal background" }];
      })
    : [];

  return {
    enabled: source.enabled === true,
    title: typeof source.title === "string" ? source.title.slice(0, 100) : "",
    subtitle: typeof source.subtitle === "string" ? source.subtitle.slice(0, 240) : "",
    startsAt: validDateString(source.startsAt),
    endsAt: validDateString(source.endsAt),
    accentColor: typeof source.accentColor === "string" && /^#[0-9a-fA-F]{6}$/.test(source.accentColor)
      ? source.accentColor
      : DEFAULT_SEASONAL_THEME.accentColor,
    overlayOpacity: typeof source.overlayOpacity === "number" && Number.isFinite(source.overlayOpacity)
      ? Math.min(90, Math.max(0, Math.round(source.overlayOpacity)))
      : DEFAULT_SEASONAL_THEME.overlayOpacity,
    images,
  };
}

export function isSeasonalThemeActive(theme: SeasonalTheme, now = new Date()): boolean {
  if (!theme.enabled || theme.images.length === 0) return false;
  const start = theme.startsAt ? new Date(theme.startsAt) : null;
  const end = theme.endsAt ? new Date(theme.endsAt) : null;
  if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()))) return false;
  return (!start || now >= start) && (!end || now <= end);
}

export async function getSeasonalTheme(): Promise<SeasonalTheme> {
  const setting = await prisma.siteSetting.findUnique({ where: { key: SEASONAL_THEME_KEY } });
  if (!setting) return DEFAULT_SEASONAL_THEME;

  try {
    return normalizeSeasonalTheme(JSON.parse(setting.value));
  } catch {
    return DEFAULT_SEASONAL_THEME;
  }
}

export function isAllowedThemeImage(src: string): boolean {
  return src.startsWith("/media/") || src.startsWith("/uploads/themes/") || /^https:\/\//i.test(src);
}

function validDateString(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
