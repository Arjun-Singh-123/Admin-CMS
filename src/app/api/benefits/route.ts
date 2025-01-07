import { createBenefit, getAllBenefits } from "@/services/benefit";
import { Benefit } from "@/types/benefit-types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const benefits = await getAllBenefits();
    return NextResponse.json(benefits);
  } catch (error) {
    console.error("Error fetching benefits:", error);
    return NextResponse.json(
      { error: "Failed to fetch benefits" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const benefit: Omit<Benefit, "id"> = await request.json();
    const newBenefit = await createBenefit(benefit);
    return NextResponse.json(newBenefit, { status: 201 });
  } catch (error) {
    console.error("Error creating benefit:", error);
    return NextResponse.json(
      { error: "Failed to create benefit" },
      { status: 500 }
    );
  }
}
