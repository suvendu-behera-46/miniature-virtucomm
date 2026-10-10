import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    products: [
      { id: "prod_1", name: "Family Miniature", price: 4999 },
      { id: "prod_2", name: "Couple Portrait", price: 7499 },
    ],
  });
}
