"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { iconMap, IconName } from "@/utils/icon-map";
import { BASE_API_URL } from "@/types/benefit-types";
// import { iconMap, IconName } from "@/utils/iconMap";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DevTool } from "@hookform/devtools";
import { uploadImage } from "@/utils/image-util";
type FormData = {
  contactInfo: {
    email: string;
    phone: string;
    hours: string;
    address: string;
    image: string;
  };
  socialLinks: {
    icon: IconName;
    href: string;
    label: string;
  }[];
  routes: {
    name: string;
    href: string;
  }[];
};

const fetchCMSData = async (): Promise<FormData> => {
  const response = await fetch(`${BASE_API_URL}/cms-data`);
  if (!response.ok) {
    throw new Error("Failed to fetch CMS data");
  }
  return response.json();
};

const updateCMSData = async (data: FormData): Promise<FormData> => {
  const response = await fetch(`${BASE_API_URL}/cms-data`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update CMS data");
  }
  return response.json();
};

const deleteCMSData = async (): Promise<void> => {
  const response = await fetch(`${BASE_API_URL}/cms-data`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete CMS data");
  }
};

export default function CMSUpdateForm() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const queryClient = useQueryClient();
  const { register, control, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: {},
  });
  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({
    control,
    name: "socialLinks",
  });
  const {
    fields: routeFields,
    append: appendRoute,
    remove: removeRoute,
  } = useFieldArray({
    control,
    name: "routes",
  });

  const { data, isLoading, error } = useQuery<FormData>({
    queryKey: ["cmsData"],
    queryFn: () => fetchCMSData(),
  });

  console.log(data, "data");

  const updateMutation = useMutation({
    mutationFn: updateCMSData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsData"] });
      toast.success("CMS data updated successfully");
    },
    onError: () => {
      toast.error("Failed to update CMS data");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCMSData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsData"] });
      toast.success("CMS data deleted successfully");
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete CMS data");
    },
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  // const onSubmit = (formData: FormData) => {
  //   console.log(formData, "formData");
  //   updateMutation.mutate(formData);
  // };

  const onSubmit = async (formData: FormData) => {
    if (imageFile) {
      try {
        const imageUrl = await uploadImage(imageFile);
        formData.contactInfo.image = imageUrl;
      } catch (error) {
        toast.error("Failed to upload image");
        return;
      }
    }
    updateMutation.mutate(formData);
  };
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading CMS data</div>;

  return (
    <div>
      <DevTool control={control} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input {...register("contactInfo.email")} placeholder="Email" />
            <Input {...register("contactInfo.phone")} placeholder="Phone" />
            <Textarea {...register("contactInfo.hours")} placeholder="Hours" />
            <Textarea
              {...register("contactInfo.address")}
              placeholder="Address"
            />
            <div className="col-span-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {watch("contactInfo.image") && (
                <img
                  src={watch("contactInfo.image")}
                  alt="Contact"
                  className="mt-2 max-w-xs"
                />
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Social Links</h2>
          {socialFields?.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2 mb-2">
              {/* <Select {...register(`socialLinks.${index}.icon`)}    >
              {Object.keys(iconMap ?? {})?.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </Select> */}

              <Select {...register(`socialLinks.${index}.icon`)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Icons</SelectLabel>
                    {Object.keys(iconMap ?? {}).map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                {...register(`socialLinks.${index}.href`)}
                placeholder="URL"
              />
              <Input
                {...register(`socialLinks.${index}.label`)}
                placeholder="Label"
              />
              <Button type="button" onClick={() => removeSocial(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() =>
              appendSocial({ icon: "Facebook", href: "", label: "" })
            }
          >
            Add Social Link
          </Button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Routes</h2>
          {routeFields?.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2 mb-2">
              <Input
                {...register(`routes.${index}.name`)}
                placeholder="Route Name"
              />
              <Input
                {...register(`routes.${index}.href`)}
                placeholder="Route URL"
              />
              <Button type="button" onClick={() => removeRoute(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => appendRoute({ name: "", href: "" })}
          >
            Add Route
          </Button>
        </div>

        <div className="flex space-x-4">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Updating..." : "Update CMS Data"}
          </Button>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive">Delete CMS Data</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to delete all CMS data?
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All CMS data will be permanently
                  deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </div>
  );
}
