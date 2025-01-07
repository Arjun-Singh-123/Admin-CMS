import { query } from "@/lib/db";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
export interface AdditionalContent {
  title: string;
  description: string;
}
interface SectionData {
  content: string;
}
export interface AboutContent {
  title: string;
  description: string;
  button_text: string;
  image_url?: string;
  additional_content: AdditionalContent[];
}

export async function getAbout(): Promise<AboutContent | null> {
  try {
    const [data] = await query(`
      SELECT content FROM sections
      WHERE name = 'About'
    `);
    console.log(data);
    return (data as any) || null;
  } catch (error) {
    console.error("Error fetching about content:", error);
    throw new Error("Failed to fetch about content");
  }
}

export async function createAbout(content: AboutContent): Promise<void> {
  try {
    await query(
      `
      INSERT INTO sections (name, content, type, is_visible, display_order)
      VALUES ('About', $1, 'static', true, 0)
      ON CONFLICT (name) DO UPDATE
      SET content = $1, is_visible = true
    `,
      [JSON.stringify(content)]
    );
  } catch (error) {
    console.error("Error creating about content:", error);
    throw new Error("Failed to create about content");
  }
}

export async function updateAbout(content: AboutContent): Promise<void> {
  try {
    await query(
      `
      UPDATE sections
      SET content = $1, is_visible = true
      WHERE name = 'About'
    `,
      [JSON.stringify(content)]
    );
  } catch (error) {
    console.error("Error updating about content:", error);
    throw new Error("Failed to update about content");
  }
}

export async function deleteAboutContent(): Promise<void> {
  try {
    await query(`
      UPDATE sections
      SET content = NULL, is_visible = false
      WHERE name = 'About'
    `);
  } catch (error) {
    console.error("Error deleting about content:", error);
    throw new Error("Failed to delete about content");
  }
}

// import
//
// { supabase } from "@/lib/supabase";

// export interface AboutContent {
//   title: string;
//   description: string;
//   button_text: string;
//   image_url?: string;
// }

// export async function getAbout(): Promise<AboutContent | null> {
//   const { data, error } = await supabase
//     .from("sections")
//     .select("content")
//     .eq("name", "About")
//     .single();

//   if (error) {
//     if (error.code === "PGRST116") {
//       return null;
//     }
//     throw error;
//   }
//   return data.content;
// }

// export async function createAbout(content: AboutContent): Promise<void> {
//   const { error } = await supabase.from("sections").insert({
//     name: "About",
//     content,
//     type: "static",
//     is_visible: false,
//     display_order: 0,
//   });

//   if (error) throw error;
// }

// export async function updateAbout(content: AboutContent): Promise<void> {
//   const { error } = await supabase
//     .from("sections")
//     .update({ content, is_visible: false })
//     .eq("name", "About");

//   if (error) throw error;
// }

// export async function deleteAboutContent(): Promise<void> {
//   const { error } = await supabase
//     .from("sections")
//     .update({ content: null })
//     .eq("name", "About");

//   if (error) throw error;
// }

export async function uploadImage(
  file: File,
  pathname?: string
): Promise<string> {
  try {
    console.log("📂 File selected for upload:", file.name);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${pathname}/${fileName}`;
    console.log("📁 File path generated:", filePath);

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: filePath,
      Body: file,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(params);
    console.log("📤 PutObjectCommand created successfully");

    const uploadResult = await s3Client.send(command);
    console.log("✅ File uploaded successfully:", uploadResult);

    const publicUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${filePath}`;
    console.log("🌐 Uploaded URL:", publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("❌ Error in uploadImage function:", error);
    throw error;
  }
}

// const handleImageUpload = async (
//   event: React.ChangeEvent<HTMLInputElement>,
//   memberId: string
// ) => {
//   const file = event.target.files?.[0];
//   if (!file) {
//     console.log("⚠️ No file selected. Exiting upload process.");
//     return;
//   }

//   console.log("📂 File selected for upload:", file.name);

//   setUploadingImage(true);
//   try {
//     if (!s3Client) {
//       console.error(
//         "❌ s3Client is not initialized. Check your AWS configuration."
//       );
//       throw new Error("s3Client is undefined");
//     }
//     console.log("✅ s3Client initialized successfully:", s3Client);

//     const fileExt = file.name.split(".").pop();
//     const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
//     const filePath = `member-images/${fileName}`;
//     console.log("📁 File path generated:", filePath);

//     const params = {
//       Bucket: "sailing-club",
//       Key: filePath,
//       Body: file,
//       ContentType: file.type,
//     };

//     const command = new PutObjectCommand(params);
//     console.log("📤 PutObjectCommand created successfully:", command);

//     // Perform upload
//     const uploadResult = await s3Client.send(command);
//     console.log("✅ File uploaded successfully:", uploadResult);

//     const BUCKET_NAME = "sailing-club";
//     const uploadedUrl = `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${filePath}`;
//     console.log("🌐 Uploaded URL:", uploadedUrl);

//     if (uploadedUrl) {
//       const updatedMember = {
//         id: memberId,
//         profile_image_url: uploadedUrl,
//       };
//       console.log(
//         "🔄 Updating member with new profile image:",
//         updatedMember
//       );

//       updateMutation.mutate(updatedMember);
//       toast.success("Image uploaded successfully");
//     }
//   } catch (error) {
//     console.error("❌ Error uploading image:", error);
//     toast.error("Error uploading image. Please try again.");
//   } finally {
//     setUploadingImage(false);
//     console.log("🏁 Upload process completed.");
//   }
// };
