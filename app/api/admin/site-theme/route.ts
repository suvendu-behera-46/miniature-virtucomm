import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  DEFAULT_SEASONAL_THEME,
  normalizeSeasonalTheme,
  SEASONAL_THEME_KEY,
} from "@/lib/seasonal-theme";

async function adminIsAuthorized() {
  const session = await auth();
  const role = (session?.user as NonNullable<typeof session>["user"] & { role?: string } | undefined)?.role;
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function GET() {
  if (!(await adminIsAuthorized())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: SEASONAL_THEME_KEY } });
    if (!setting) return NextResponse.json(DEFAULT_SEASONAL_THEME);
    return NextResponse.json(normalizeSeasonalTheme(JSON.parse(setting.value)));
  } catch {
    return NextResponse.json({ error: "Seasonal theme settings could not be loaded." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  if (!(await adminIsAuthorized())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send valid JSON settings." }, { status: 400 });
  }

  const theme = normalizeSeasonalTheme(body);
  if (theme.enabled && (!theme.title || theme.images.length === 0)) {
    return NextResponse.json({ error: "Add a theme title and at least one background image before enabling it." }, { status: 400 });
  }

  if (theme.startsAt && theme.endsAt && new Date(theme.endsAt) < new Date(theme.startsAt)) {
    return NextResponse.json({ error: "The end date must be after the start date." }, { status: 400 });
  }

  try {
    await prisma.siteSetting.upsert({
      where: { key: SEASONAL_THEME_KEY },
      update: { value: JSON.stringify(theme), description: "Admin-managed seasonal storefront theme" },
      create: { key: SEASONAL_THEME_KEY, value: JSON.stringify(theme), description: "Admin-managed seasonal storefront theme" },
    });
    return NextResponse.json({ success: true, theme });
  } catch {
    return NextResponse.json({ error: "Seasonal theme settings could not be saved. Check the database connection." }, { status: 503 });
  }
}
