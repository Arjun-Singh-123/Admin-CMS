import { getRentals } from "@/services/rental-services";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rentals = await getRentals();
    return NextResponse.json(rentals);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rentals" },
      { status: 500 }
    );
  }
}

// export async function PUT(request: Request) {
//   try {
//     const rentalData = await request.json() as RentalData
//     const updatedRental = await updateRentals(rentalData)
//     return NextResponse.json(updatedRental)
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to update rentals' }, { status: 500 })
//   }
// }
