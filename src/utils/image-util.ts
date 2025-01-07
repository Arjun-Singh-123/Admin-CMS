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
