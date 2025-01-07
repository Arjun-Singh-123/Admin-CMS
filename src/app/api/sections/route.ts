import { NextResponse } from "next/server";
// import {
//   getSections,
//   createSection,
//   updateSection,
//   deleteSection,
// } from "@/services/section-services";
import {
  fetchSectionsAndNavItemsDashboard,
  updateSectionStatusDashboard,
} from "@/services/dashboard-services";

export async function GET() {
  try {
    const sections = await fetchSectionsAndNavItemsDashboard();
    return NextResponse.json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { sectionId, status } = await request.json();
    const newSection = await updateSectionStatusDashboard(sectionId, status);
    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}

// export async function PUT(request: Request) {
//   try {
//     const { id, name, display_order, status } = await request.json();
//     const updatedSection = await updateSection({
//       id,
//       name,
//       display_order,
//       status,
//     });
//     return NextResponse.json(updatedSection);
//   } catch (error) {
//     console.error("Error updating section:", error);
//     return NextResponse.json(
//       { error: "Failed to update section" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: Request) {
//   try {
//     const { id } = await request.json();
//     const deletedSection = await deleteSection(id);
//     return NextResponse.json(deletedSection);
//   } catch (error) {
//     console.error("Error deleting section:", error);
//     return NextResponse.json(
//       { error: "Failed to delete section" },
//       { status: 500 }
//     );
//   }
// }
