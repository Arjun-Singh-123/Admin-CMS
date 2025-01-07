import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT * FROM footer_contentsa ORDER BY id DESC LIMIT 1"
    );
    return NextResponse.json(result[0] || null);
  } catch (error) {
    console.error("Error fetching footer content:", error);
    return NextResponse.json(
      { error: "Failed to fetch footer content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = await query(
      "INSERT INTO footer_contentsa (content) VALUES ($1) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content RETURNING *",
      [body.content]
    );
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating footer content:", error);
    return NextResponse.json(
      { error: "Failed to update footer content" },
      { status: 500 }
    );
  }
}
