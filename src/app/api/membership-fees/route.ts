import { NextResponse } from "next/server";
import {
  getMembershipFees,
  updateMembershipFees,
} from "@/services/membership-services";

export async function GET() {
  console.log("reached get request");
  try {
    const fees = await getMembershipFees();
    console.log("fees", fees);
    return NextResponse.json(fees);
  } catch (error) {
    console.error("Error fetching membership fees:", error);
    return NextResponse.json(
      { error: "Failed to fetch membership fees" },
      { status: 500 }
    );
  }
}

// export async function PUT(request: Request) {
//   console.log("I'm in a put request");
//   try {
//     const fees = await request.json();
//     const updatedFees = await updateMembershipFees(fees);
//     return NextResponse.json(updatedFees);
//   } catch (error) {
//     console.error("Error updating membership fees:", error);
//     return NextResponse.json(
//       { error: "Failed to update membership fees" },
//       { status: 500 }
//     );
//   }
// }
