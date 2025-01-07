import { NextResponse } from "next/server";
import { updateMembershipFees } from "@/services/membership-services"; // Adjust the import path as needed

export async function PUT(request: Request) {
  console.log("I'm in a put request");
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Extract the 'id' from the URL

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const fees = await request.json();
    const updatedFees = await updateMembershipFees(id, fees); // Pass the 'id' to the update function

    return NextResponse.json(updatedFees);
  } catch (error) {
    console.error("Error updating membership fees:", error);
    return NextResponse.json(
      { error: "Failed to update membership fees" },
      { status: 500 }
    );
  }
}
