import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { adminRoles, type AdminRole } from "@/lib/admin-auth";
import { formatDate, humanize, toNumber } from "@/lib/format";
import { buildOrderFilter } from "@/lib/order-filter";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!adminRoles.includes(role as AdminRole)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const orders = await prisma.order.findMany({
    where: buildOrderFilter(searchParams.get("q") ?? "", searchParams.get("status") ?? ""),
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["Order number", "Date", "Status", "Priority", "Customer", "Email", "Phone", "Product", "Subtotal", "Discount", "Total", "Shipping address", "Instructions"],
    ...orders.map((order) => [
      order.orderNumber,
      formatDate(order.createdAt, true),
      humanize(order.status),
      order.priority,
      order.customer?.name ?? "",
      order.customer?.email ?? "",
      order.customer?.phone ?? "",
      order.productName ?? "",
      toNumber(order.amount).toFixed(2),
      toNumber(order.discount).toFixed(2),
      toNumber(order.finalAmount).toFixed(2),
      order.shippingAddress ?? "",
      order.specialInstructions ?? "",
    ]),
  ];

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function csvCell(value: string) {
  // Prefix formula-like values so spreadsheets don't execute them.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
