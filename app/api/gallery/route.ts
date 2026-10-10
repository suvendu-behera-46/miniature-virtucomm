import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    items: [
      { id: "g1", title: "Family memories", category: "Family", active: true },
      { id: "g2", title: "Wedding day", category: "Wedding", active: true },
      { id: "g3", title: "Pet portraits", category: "Pets", active: true },
    ],
  });
}
