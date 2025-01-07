import { NextResponse } from "next/server";
import {
  getCMSData,
  updateCMSData,
  createCMSData,
  deleteCMSData,
} from "@/services/contact-cms";
import { CMSData } from "@/types/cms-types";

export async function GET() {
  try {
    const cmsData = await getCMSData();
    return NextResponse.json(cmsData);
  } catch (error) {
    console.error("Error fetching CMS data:", error);
    return NextResponse.json(
      { error: "Failed to fetch CMS data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newData: CMSData = await request.json();
    const createdData = await createCMSData(newData);
    return NextResponse.json(createdData, { status: 201 });
  } catch (error) {
    console.error("Error creating CMS data:", error);
    return NextResponse.json(
      { error: "Failed to create CMS data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const updatedData: Partial<CMSData> = await request.json();
    const result = await updateCMSData(updatedData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating CMS data:", error);
    return NextResponse.json(
      { error: "Failed to update CMS data" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await deleteCMSData();
    return NextResponse.json({ message: "CMS data deleted successfully" });
  } catch (error) {
    console.error("Error deleting CMS data:", error);
    return NextResponse.json(
      { error: "Failed to delete CMS data" },
      { status: 500 }
    );
  }
}
