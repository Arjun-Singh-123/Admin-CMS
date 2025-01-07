import { NextResponse } from "next/server";
import { updateBenefit, deleteBenefit } from "@/services/benefit";
import { Benefit } from "@/types/benefit-types";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const benefit: Partial<Benefit> = await request.json();
    const updatedBenefit = await updateBenefit(params.id, benefit);
    return NextResponse.json(updatedBenefit);
  } catch (error) {
    console.error("Error updating benefit:", error);
    return NextResponse.json(
      { error: "Failed to update benefit" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await deleteBenefit(params.id);
    return NextResponse.json({ message: "Benefit deleted successfully" });
  } catch (error) {
    console.error("Error deleting benefit:", error);
    return NextResponse.json(
      { error: "Failed to delete benefit" },
      { status: 500 }
    );
  }
}
