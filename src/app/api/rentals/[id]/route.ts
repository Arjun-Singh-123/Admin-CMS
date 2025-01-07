import { getRentalById, updateRental } from "@/services/rental-services";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("checking id", params.id);
  try {
    const rental = await getRentalById(params.id);
    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }
    return NextResponse.json(rental);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rental" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("PATCH request", params.id);
  try {
    const data = await request.json();
    const updatedRental = await updateRental(params.id, data);
    return NextResponse.json(updatedRental);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update rental" },
      { status: 500 }
    );
  }
}

// export async function PATCH(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     console.log("PATCH request", params.id);
//     const schema = await request.json();
//     const updatedRental = await updateRentalSchema(Number(params.id), schema);
//     return NextResponse.json(updatedRental);
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to update rental schema" },
//       { status: 500 }
//     );
//   }
// }
