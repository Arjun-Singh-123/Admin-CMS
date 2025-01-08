import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const handleImageUpload = async (
  event: React.ChangeEvent<HTMLInputElement>,
  memberId: string,
  setUploadingImage: React.Dispatch<React.SetStateAction<boolean>>,
  updateMutation: any
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setUploadingImage(true);
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `member-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("images").getPublicUrl(filePath);

    if (data?.publicUrl) {
      const updatedMember = {
        id: memberId,
        profile_image_url: data.publicUrl,
      };
      updateMutation.mutate(updatedMember);
      toast.success("Image uploaded successfully");
    }
  } catch (error) {
    toast.error("Error uploading image");
    console.error("Error uploading image:", error);
  } finally {
    setUploadingImage(false);
  }
};

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";

export async function uploadImage(file: File): Promise<string> {
  try {
    console.log("📂 File selected for upload:", file.name);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `about-images/${fileName}`;
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
