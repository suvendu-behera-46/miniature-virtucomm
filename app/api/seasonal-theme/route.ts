import { NextResponse } from "next/server";
import {
  DEFAULT_SEASONAL_THEME,
  getSeasonalTheme,
  isSeasonalThemeActive,
} from "@/lib/seasonal-theme";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const theme = await getSeasonalTheme();
    if (!isSeasonalThemeActive(theme)) {
      return NextResponse.json({ ...DEFAULT_SEASONAL_THEME, accentColor: theme.accentColor });
    }
    return NextResponse.json(theme);
  } catch {
    return NextResponse.json(DEFAULT_SEASONAL_THEME);
  }
}
