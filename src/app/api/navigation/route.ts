import { NextResponse } from "next/server";
import {
  fetchNavItems,
  createNavItem,
  updateNavItem,
  deleteNavItem,
  createNavSection,
  updateNavSection,
  deleteNavSection,
} from "@/app/services/navigation";

export async function GET() {
  try {
    const navItems = await fetchNavItems();
    return NextResponse.json(navItems);
  } catch (error) {
    console.error("Error in navigation API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.type === "navItem") {
      await createNavItem(body.data);
    } else if (body.type === "navSection") {
      await createNavSection(body.data);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json({ message: "Created successfully" });
  } catch (error) {
    console.error("Error in navigation API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (body.type === "navItem") {
      await updateNavItem(body.id, body.data);
    } else if (body.type === "navSection") {
      await updateNavSection(body.id, body.data);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json({ message: "Updated successfully" });
  } catch (error) {
    console.error("Error in navigation API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    if (!id || !type) {
      return NextResponse.json(
        { error: "Missing id or type" },
        { status: 400 }
      );
    }
    if (type === "navItem") {
      await deleteNavItem(id);
    } else if (type === "navSection") {
      await deleteNavSection(id);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error in navigation API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
