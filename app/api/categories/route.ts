import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    categories: [
      { id: "cat_1", name: "Family", slug: "family", active: true },
      { id: "cat_2", name: "Couple", slug: "couple", active: true },
      { id: "cat_3", name: "Pets", slug: "pets", active: true },
    ],
  });
}
