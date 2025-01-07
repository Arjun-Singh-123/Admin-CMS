import { NextResponse } from "next/server";
import {
  getFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
} from "@/services/feature-services";

export async function GET() {
  console.log("I'm in a get request");
  try {
    const features = await getFeatures();
    return NextResponse.json(features);
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const newFeature = await createFeature(name);
    return NextResponse.json(newFeature, { status: 201 });
  } catch (error) {
    console.error("Error creating feature:", error);
    return NextResponse.json(
      { error: "Failed to create feature" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();
    const updatedFeature = await updateFeature(id, name);
    return NextResponse.json(updatedFeature);
  } catch (error) {
    console.error("Error updating feature:", error);
    return NextResponse.json(
      { error: "Failed to update feature" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await deleteFeature(id);
    return NextResponse.json({ message: "Feature deleted successfully" });
  } catch (error) {
    console.error("Error deleting feature:", error);
    return NextResponse.json(
      { error: "Failed to delete feature" },
      { status: 500 }
    );
  }
}
