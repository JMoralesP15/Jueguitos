import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ message: "No autorizado" }, { status: 403 });

  const { data, error } = await supabase
    .from("items")
    .select("name, category, city, address, instagram_url, website_url, image_path, status, created_at")
    .eq("status", "pending")
    .eq("created_by", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ message: "No pudimos exportar el lote" }, { status: 500 });

  const columns = ["name", "category", "city", "address", "instagram_url", "website_url", "image_path", "status", "created_at"];
  const rows = (data ?? []).map((item) => columns.map((column) => csvCell(item[column as keyof typeof item])).join(","));
  const csv = `\uFEFF${columns.join(",")}\n${rows.join("\n")}\n`;

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="locales-pendientes.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
