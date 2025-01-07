"use client";

import { useState, useEffect, use } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { uploadImage } from "@/services/about-services";
import { BASE_API_URL } from "@/types/benefit-types";

const schema = z.object({
  id: z.string().uuid().optional(),
  content: z.object({
    initialMembershipFee: z.number().min(0),
    damageDeposit: z.number().min(0),
    monthlyMembershipFee: z.number().min(0),
    certificationRide: z.string(),
    initialMembershipTotal: z.number().min(0),
    monthlyDuesTotal: z.object({
      amount: z.number().min(0),
      administrationFee: z.number().min(0),
      membershipFee: z.number().min(0),
    }),
    checkRide: z.number().min(0),
    notes: z.string(),
  }),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image_url: z.string().url().optional().or(z.literal("")),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function MembershipFeesPage() {
  const [isEditing, setIsEditing] = useState(false);
  // const [membershipFees, setMembershipFees] = useState<FormData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: {
        initialMembershipFee: 0,
        damageDeposit: 0,
        monthlyMembershipFee: 0,
        certificationRide: "",
        initialMembershipTotal: 0,
        monthlyDuesTotal: {
          amount: 0,
          administrationFee: 0,
          membershipFee: 0,
        },
        checkRide: 0,
        notes: "",
      },
      title: "",
      description: "",
      image_url: "",
    },
  });

  // useEffect(() => {
  //   fetchMembershipFees();
  // }, []);

  const { data: membershipFees } = useQuery({
    queryKey: ["membershipFees"],
    queryFn: () => fetchMembershipFees(),
  });
  console.log(membershipFees);
  const fetchMembershipFees = async () => {
    try {
      console.log(`${BASE_API_URL}/membership-fees`);
      const response = await fetch(`${BASE_API_URL}/membership-fees`);
      console.log(response);
      const data = await response.json();
      reset(data);
      return data;
    } catch (error) {
      throw new Error(`Error fetching membership fees: ${error}`);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`${BASE_API_URL}/membership-fees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create membership fees");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membershipFees"] });
      toast.success("Membership fees created successfully");
      setIsEditing(false);
      fetchMembershipFees();
    },
    onError: () => {
      toast.error("Failed to create membership fees");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(
        `${BASE_API_URL}/membership-fees/${data.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update membership fees");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membershipFees"] });
      toast.success("Membership fees updated successfully");
      setIsEditing(false);
      fetchMembershipFees();
    },
    onError: () => {
      toast.error("Failed to update membership fees");
    },
  });

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const publicUrl = await uploadImage(file, "membership-fees");
      setValue("image_url", publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Error uploading image");
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (membershipFees) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = async () => {
    if (!membershipFees) return;

    const response = await fetch(
      `${BASE_API_URL}/membership-fees/${membershipFees.id}`,
      {
        method: "DELETE",
      }
    );
    if (response.ok) {
      toast.success("Membership fees deleted successfully");
      // setMembershipFees(null);
      reset({
        content: {
          initialMembershipFee: 0,
          damageDeposit: 0,
          monthlyMembershipFee: 0,
          certificationRide: "",
          initialMembershipTotal: 0,
          monthlyDuesTotal: {
            amount: 0,
            administrationFee: 0,
            membershipFee: 0,
          },
          checkRide: 0,
          notes: "",
        },
        title: "",
        description: "",
        image_url: "",
      });
    } else {
      toast.error("Failed to delete membership fees");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Membership Fees</h1>
      {!isEditing && membershipFees ? (
        <Card>
          <CardHeader>
            <CardTitle>{membershipFees.title}</CardTitle>
            <CardDescription>{membershipFees.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {membershipFees.image_url && (
              <img
                src={membershipFees.image_url}
                alt="Membership"
                className="mb-4 rounded-lg"
              />
            )}
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="font-semibold">Initial Membership Fee</dt>
                <dd>${membershipFees.content.initialMembershipFee}</dd>
              </div>
              <div>
                <dt className="font-semibold">Damage Deposit</dt>
                <dd>${membershipFees.content.damageDeposit}</dd>
              </div>
              <div>
                <dt className="font-semibold">Monthly Membership Fee</dt>
                <dd>${membershipFees.content.monthlyMembershipFee}</dd>
              </div>
              <div>
                <dt className="font-semibold">Certification Ride</dt>
                <dd>{membershipFees.content.certificationRide}</dd>
              </div>
              <div>
                <dt className="font-semibold">Initial Membership Total</dt>
                <dd>${membershipFees.content.initialMembershipTotal}</dd>
              </div>
              <div>
                <dt className="font-semibold">Monthly Dues Total</dt>
                <dd>${membershipFees.content.monthlyDuesTotal.amount}</dd>
              </div>
              <div>
                <dt className="font-semibold">Administration Fee</dt>
                <dd>
                  ${membershipFees.content.monthlyDuesTotal.administrationFee}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Membership Fee</dt>
                <dd>
                  ${membershipFees.content.monthlyDuesTotal.membershipFee}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Check Ride</dt>
                <dd>${membershipFees.content.checkRide}</dd>
              </div>
              <div>
                <dt className="font-semibold">Notes</dt>
                <dd>{membershipFees.content.notes}</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="Title"
              className="mt-1 block w-full"
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <Textarea
              id="description"
              {...register("description", {
                required: "Description is required",
              })}
              placeholder="Description"
              className="mt-1 block w-full"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              Upload Image
            </label>
            <Input
              id="image"
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              className="mt-1 block w-full"
            />
            {uploadingImage && <p>Uploading image...</p>}
          </div>

          <div>
            <label
              htmlFor="initialMembershipFee"
              className="block text-sm font-medium text-gray-700"
            >
              Initial Membership Fee
            </label>
            <Input
              id="initialMembershipFee"
              {...register("content.initialMembershipFee", {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Initial Membership Fee"
              className="mt-1 block w-full"
            />
            {errors.content?.initialMembershipFee && (
              <p className="text-red-500">
                {errors.content.initialMembershipFee.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="damageDeposit"
              className="block text-sm font-medium text-gray-700"
            >
              Damage Deposit
            </label>
            <Input
              id="damageDeposit"
              {...register("content.damageDeposit", { valueAsNumber: true })}
              type="number"
              placeholder="Damage Deposit"
              className="mt-1 block w-full"
            />
            {errors.content?.damageDeposit && (
              <p className="text-red-500">
                {errors.content.damageDeposit.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="monthlyMembershipFee"
              className="block text-sm font-medium text-gray-700"
            >
              Monthly Membership Fee
            </label>
            <Input
              id="monthlyMembershipFee"
              {...register("content.monthlyMembershipFee", {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Monthly Membership Fee"
              className="mt-1 block w-full"
            />
            {errors.content?.monthlyMembershipFee && (
              <p className="text-red-500">
                {errors.content.monthlyMembershipFee.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="certificationRide"
              className="block text-sm font-medium text-gray-700"
            >
              Certification Ride
            </label>
            <Input
              id="certificationRide"
              {...register("content.certificationRide")}
              placeholder="Certification Ride"
              className="mt-1 block w-full"
            />
            {errors.content?.certificationRide && (
              <p className="text-red-500">
                {errors.content.certificationRide.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="initialMembershipTotal"
              className="block text-sm font-medium text-gray-700"
            >
              Initial Membership Total
            </label>
            <Input
              id="initialMembershipTotal"
              {...register("content.initialMembershipTotal", {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Initial Membership Total"
              className="mt-1 block w-full"
            />
            {errors.content?.initialMembershipTotal && (
              <p className="text-red-500">
                {errors.content.initialMembershipTotal.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="monthlyDuesTotalAmount"
              className="block text-sm font-medium text-gray-700"
            >
              Monthly Dues Total Amount
            </label>
            <Input
              id="monthlyDuesTotalAmount"
              {...register("content.monthlyDuesTotal.amount", {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Monthly Dues Total Amount"
              className="mt-1 block w-full"
            />
            {errors.content?.monthlyDuesTotal?.amount && (
              <p className="text-red-500">
                {errors.content.monthlyDuesTotal.amount.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="administrationFee"
              className="block text-sm font-medium text-gray-700"
            >
              Administration Fee
            </label>
            <Input
              id="administrationFee"
              {...register("content.monthlyDuesTotal.administrationFee", {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Administration Fee"
              className="mt-1 block w-full"
            />
            {errors.content?.monthlyDuesTotal?.administrationFee && (
              <p className="text-red-500">
                {errors.content.monthlyDuesTotal.administrationFee.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="membershipFee"
              className="block text-sm font-medium text-gray-700"
            >
              Membership Fee
            </label>
            <Input
              id="membershipFee"
              {...register("content.monthlyDuesTotal.membershipFee", {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Membership Fee"
              className="mt-1 block w-full"
            />
            {errors.content?.monthlyDuesTotal?.membershipFee && (
              <p className="text-red-500">
                {errors.content.monthlyDuesTotal.membershipFee.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="checkRide"
              className="block text-sm font-medium text-gray-700"
            >
              Check Ride
            </label>
            <Input
              id="checkRide"
              {...register("content.checkRide", { valueAsNumber: true })}
              type="number"
              placeholder="Check Ride"
              className="mt-1 block w-full"
            />
            {errors.content?.checkRide && (
              <p className="text-red-500">{errors.content.checkRide.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Notes
            </label>
            <Input
              id="notes"
              {...register("content.notes")}
              type="text"
              placeholder="Write notes"
              className="mt-1 block w-full"
            />
            {errors.content?.notes && (
              <p className="text-red-500">{errors.content.notes.message}</p>
            )}
          </div>

          <Button type="submit" className="m-4">
            Save
          </Button>
          {isEditing && (
            <Button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </form>

        // <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        //   <Input {...register("title")} placeholder="Title" />
        //   {errors.title && (
        //     <p className="text-red-500">{errors.title.message}</p>
        //   )}

        //   <Textarea {...register("description")} placeholder="Description" />
        //   {errors.description && (
        //     <p className="text-red-500">{errors.description.message}</p>
        //   )}

        //   <div>
        //     <Input type="file" onChange={handleImageUpload} accept="image/*" />
        //     {uploadingImage && <p>Uploading image...</p>}
        //   </div>

        //   <Input
        //     {...register("content.initialMembershipFee", {
        //       valueAsNumber: true,
        //     })}
        //     type="number"
        //     placeholder="Initial Membership Fee"
        //   />
        //   {errors.content?.initialMembershipFee && (
        //     <p className="text-red-500">
        //       {errors.content.initialMembershipFee.message}
        //     </p>
        //   )}

        //   <Input
        //     {...register("content.damageDeposit", { valueAsNumber: true })}
        //     type="number"
        //     placeholder="Damage Deposit"
        //   />
        //   {errors.content?.damageDeposit && (
        //     <p className="text-red-500">
        //       {errors.content.damageDeposit.message}
        //     </p>
        //   )}

        //   <Input
        //     {...register("content.monthlyMembershipFee", {
        //       valueAsNumber: true,
        //     })}
        //     type="number"
        //     placeholder="Monthly Membership Fee"
        //   />
        //   {errors.content?.monthlyMembershipFee && (
        //     <p className="text-red-500">
        //       {errors.content.monthlyMembershipFee.message}
        //     </p>
        //   )}

        //   <Input
        //     {...register("content.certificationRide")}
        //     placeholder="Certification Ride"
        //   />
        //   {errors.content?.certificationRide && (
        //     <p className="text-red-500">
        //       {errors.content.certificationRide.message}
        //     </p>
        //   )}

        //   <Input
        //     {...register("content.initialMembershipTotal", {
        //       valueAsNumber: true,
        //     })}
        //     type="number"
        //     placeholder="Initial Membership Total"
        //   />
        //   {errors.content?.initialMembershipTotal && (
        //     <p className="text-red-500">
        //       {errors.content.initialMembershipTotal.message}
        //     </p>
        //   )}

        //   <Input
        //     {...register("content.monthlyDuesTotal.amount", {
        //       valueAsNumber: true,
        //     })}
        //     type="number"
        //     placeholder="Monthly Dues Total Amount"
        //   />
        //   {errors.content?.monthlyDuesTotal?.amount && (
        //     <p className="text-red-500">
        //       {errors.content.monthlyDuesTotal.amount.message}
        //     </p>
        //   )}

        //   <Input
        //     {...register("content.monthlyDuesTotal.administrationFee", {
        //       valueAsNumber: true,
        //     })}
        //     type="number"
        //     placeholder="Administration Fee"
        //   />
        //   {errors.content?.monthlyDuesTotal?.administrationFee && (
        //     <p className="text-red-500">
        //       {errors.content.monthlyDuesTotal.administrationFee.message}
        //     </p>
        //   )}

        //   <Input
        //     {...register("content.monthlyDuesTotal.membershipFee", {
        //       valueAsNumber: true,
        //     })}
        //     type="number"
        //     placeholder="Membership Fee"
        //   />
        //   {errors.content?.monthlyDuesTotal?.membershipFee && (
        //     <p className="text-red-500">
        //       {errors.content.monthlyDuesTotal.membershipFee.message}
        //     </p>
        //   )}

        //   <Input
        //     {...register("content.checkRide", { valueAsNumber: true })}
        //     type="number"
        //     placeholder="Check Ride"
        //   />
        //   {errors.content?.checkRide && (
        //     <p className="text-red-500">{errors.content.checkRide.message}</p>
        //   )}

        //   <Input
        //     {...register("content.notes")}
        //     type="text"
        //     placeholder="Write notes"
        //   />
        //   {errors.content?.notes && (
        //     <p className="text-red-500">{errors.content.notes.message}</p>
        //   )}

        //   <Button type="submit">Save</Button>
        //   {isEditing && (
        //     <Button type="button" onClick={() => setIsEditing(false)}>
        //       Cancel
        //     </Button>
        //   )}
        // </form>
      )}
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { useForm, SubmitHandler } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { MembershipFee } from "@/services/membership-services";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { toast } from "sonner";
// import { uploadImage } from "@/services/about-services";
// import { BASE_API_URL } from "@/types/benefit-types";

// const schema = z.object({
//   title: z.string().min(1, "Title is required"),
//   description: z.string().min(1, "Description is required"),
//   image_url: z.string().url().optional().or(z.literal("")),
//   content: z.object({
//     initialMembershipFee: z.number().min(0),
//     notes: z.string().min(1),
//     damageDeposit: z.number().min(0),
//     monthlyMembershipFee: z.number().min(0),
//     certificationRide: z.string(),
//     initialMembershipTotal: z.number().min(0),
//     monthlyDuesTotal: z.object({
//       amount: z.number().min(0),
//       administrationFee: z.number().min(0),
//       membershipFee: z.number().min(0),
//     }),
//     checkRide: z.number().min(0),
//   }),
// });

// type FormData = z.infer<typeof schema>;

// export default function MembershipFeesPage() {
//   const [isEditing, setIsEditing] = useState(false);
//   const [membershipFees, setMembershipFees] = useState<MembershipFee | null>(
//     null
//   );
//   const [uploadingImage, setUploadingImage] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     setValue,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       title: "",
//       description: "",
//       image_url: "",
//       content: {
//         initialMembershipFee: 0,
//         notes: "",
//         damageDeposit: 0,
//         monthlyMembershipFee: 0,
//         certificationRide: "",
//         initialMembershipTotal: 0,
//         monthlyDuesTotal: {
//           amount: 0,
//           administrationFee: 0,
//           membershipFee: 0,
//         },
//         checkRide: 0,
//       },
//     },
//   });

//   useEffect(() => {
//     fetchMembershipFees();
//   }, []);

//   const fetchMembershipFees = async () => {
//     const response = await fetch("/api/membership-fees");
//     if (response.ok) {
//       const data = await response.json();
//       setMembershipFees(data);
//       reset(data);
//     } else {
//       toast.error("Failed to fetch membership fees");
//     }
//   };

//   const handleImageUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setUploadingImage(true);
//     try {
//       const publicUrl = await uploadImage(file, "membership-fees");
//       setValue("image_url", publicUrl);
//       toast.success("Image uploaded successfully");
//     } catch (error) {
//       toast.error("Error uploading image");
//       console.error("Error uploading image:", error);
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   const onSubmit: SubmitHandler<FormData> = async (data) => {
//     console.log(data);
//     const response = await fetch(`${BASE_API_URL}/membership-fees`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });

//     if (response.ok) {
//       toast.success("Membership fees updated successfully");
//       setIsEditing(false);
//       fetchMembershipFees();
//     } else {
//       toast.error("Failed to update membership fees");
//     }
//   };

//   const handleDelete = async () => {
//     const response = await fetch("/api/membership-fees", { method: "DELETE" });
//     if (response.ok) {
//       toast.success("Membership fees deleted successfully");
//       setMembershipFees(null);
//       reset({
//         title: "",
//         description: "",
//         image_url: "",
//         content: {
//           initialMembershipFee: 0,
//           damageDeposit: 0,
//           notes: "",
//           monthlyMembershipFee: 0,
//           certificationRide: "",
//           initialMembershipTotal: 0,
//           monthlyDuesTotal: {
//             amount: 0,
//             administrationFee: 0,
//             membershipFee: 0,
//           },
//           checkRide: 0,
//         },
//       });
//     } else {
//       toast.error("Failed to delete membership fees");
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Membership Fees</h1>
//       {!isEditing && membershipFees ? (
//         <Card>
//           <CardHeader>
//             <CardTitle>{membershipFees.title}</CardTitle>
//             <CardDescription>{membershipFees.description}</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {membershipFees.image_url && (
//               <img
//                 src={membershipFees.image_url}
//                 alt="Membership"
//                 className="mb-4 rounded-lg"
//               />
//             )}
//             <dl className="grid grid-cols-2 gap-4">
//               <div>
//                 <dt className="font-semibold">Initial Membership Fee</dt>
//                 <dd>${membershipFees.content.initialMembershipFee}</dd>
//               </div>
//               <div>
//                 <dt className="font-semibold">Damage Deposit</dt>
//                 <dd>${membershipFees.content.damageDeposit}</dd>
//               </div>
//               <div>
//                 <dt className="font-semibold">Monthly Membership Fee</dt>
//                 <dd>${membershipFees.content.monthlyMembershipFee}</dd>
//               </div>
//               <div>
//                 <dt className="font-semibold">Certification Ride</dt>
//                 <dd>{membershipFees.content.certificationRide}</dd>
//               </div>
//               <div>
//                 <dt className="font-semibold">Initial Membership Total</dt>
//                 <dd>${membershipFees.content.initialMembershipTotal}</dd>
//               </div>
//               <div>
//                 <dt className="font-semibold">Monthly Dues Total</dt>
//                 <dd>${membershipFees.content.monthlyDuesTotal.amount}</dd>
//               </div>
//               <div>
//                 <dt className="font-semibold">Administration Fee</dt>
//                 <dd>
//                   ${membershipFees.content.monthlyDuesTotal.administrationFee}
//                 </dd>
//               </div>
//               <div>
//                 <dt className="font-semibold">Membership Fee</dt>
//                 <dd>
//                   ${membershipFees.content.monthlyDuesTotal.membershipFee}
//                 </dd>
//               </div>
//               <div>
//                 <dt className="font-semibold">Check Ride</dt>
//                 <dd>${membershipFees.content.checkRide}</dd>
//               </div>
//             </dl>
//           </CardContent>
//           <CardFooter className="flex justify-between">
//             <Button onClick={() => setIsEditing(true)}>Edit</Button>
//             <Button variant="destructive" onClick={handleDelete}>
//               Delete
//             </Button>
//           </CardFooter>
//         </Card>
//       ) : (
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <Input {...register("title")} placeholder="Title" />
//           {errors.title && (
//             <p className="text-red-500">{errors.title.message}</p>
//           )}

//           <Textarea {...register("description")} placeholder="Description" />
//           {errors.description && (
//             <p className="text-red-500">{errors.description.message}</p>
//           )}

//           <div>
//             <Input type="file" onChange={handleImageUpload} accept="image/*" />
//             {uploadingImage && <p>Uploading image...</p>}
//           </div>

//           <Input
//             {...register("content.initialMembershipFee", {
//               valueAsNumber: true,
//             })}
//             type="number"
//             placeholder="Initial Membership Fee"
//           />
//           {errors.content?.initialMembershipFee && (
//             <p className="text-red-500">
//               {errors.content.initialMembershipFee.message}
//             </p>
//           )}

//           <Input
//             {...register("content.damageDeposit", { valueAsNumber: true })}
//             type="number"
//             placeholder="Damage Deposit"
//           />
//           {errors.content?.damageDeposit && (
//             <p className="text-red-500">
//               {errors.content.damageDeposit.message}
//             </p>
//           )}

//           <Input
//             {...register("content.monthlyMembershipFee", {
//               valueAsNumber: true,
//             })}
//             type="number"
//             placeholder="Monthly Membership Fee"
//           />
//           {errors.content?.monthlyMembershipFee && (
//             <p className="text-red-500">
//               {errors.content.monthlyMembershipFee.message}
//             </p>
//           )}

//           <Input
//             {...register("content.certificationRide")}
//             placeholder="Certification Ride"
//           />
//           {errors.content?.certificationRide && (
//             <p className="text-red-500">
//               {errors.content.certificationRide.message}
//             </p>
//           )}

//           <Input
//             {...register("content.initialMembershipTotal", {
//               valueAsNumber: true,
//             })}
//             type="number"
//             placeholder="Initial Membership Total"
//           />
//           {errors.content?.initialMembershipTotal && (
//             <p className="text-red-500">
//               {errors.content.initialMembershipTotal.message}
//             </p>
//           )}

//           <Input
//             {...register("content.monthlyDuesTotal.amount", {
//               valueAsNumber: true,
//             })}
//             type="number"
//             placeholder="Monthly Dues Total Amount"
//           />
//           {errors.content?.monthlyDuesTotal?.amount && (
//             <p className="text-red-500">
//               {errors.content.monthlyDuesTotal.amount.message}
//             </p>
//           )}

//           <Input
//             {...register("content.monthlyDuesTotal.administrationFee", {
//               valueAsNumber: true,
//             })}
//             type="number"
//             placeholder="Administration Fee"
//           />
//           {errors.content?.monthlyDuesTotal?.administrationFee && (
//             <p className="text-red-500">
//               {errors.content.monthlyDuesTotal.administrationFee.message}
//             </p>
//           )}

//           <Input
//             {...register("content.monthlyDuesTotal.membershipFee", {
//               valueAsNumber: true,
//             })}
//             type="number"
//             placeholder="Membership Fee"
//           />
//           {errors.content?.monthlyDuesTotal?.membershipFee && (
//             <p className="text-red-500">
//               {errors.content.monthlyDuesTotal.membershipFee.message}
//             </p>
//           )}

//           <Input
//             {...register("content.checkRide", { valueAsNumber: true })}
//             type="number"
//             placeholder="Check Ride"
//           />
//           {errors.content?.checkRide && (
//             <p className="text-red-500">{errors.content.checkRide.message}</p>
//           )}

//           <Input
//             {...register("content.notes")}
//             type="text"
//             placeholder="write notes"
//           />
//           {errors.content?.notes && (
//             <p className="text-red-500">{errors.content.notes.message}</p>
//           )}

//           <Button type="submit">Save</Button>
//           {isEditing && (
//             <Button type="button" onClick={() => setIsEditing(false)}>
//               Cancel
//             </Button>
//           )}
//         </form>
//       )}
//     </div>
//   );
// }

// "use client";

// import React, { useState } from "react";
// import {
//   useForm,
//   useFieldArray,
//   Controller,
//   FormProvider,
// } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { FormMessage } from "@/components/ui/form";
// import { supabase } from "@/lib/supabase";
// import { toast } from "sonner";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";

// const schema = z.object({
//   id: z.string().optional(),
//   subtitle: z.string().min(1, "Subtitle is required"),
//   title: z.string().min(1, "Title is required"),
//   icon: z.string().min(1, "Icon is required"),
//   show_line: z.boolean(),
//   description: z.string().min(1, "Description is required"),
//   tableItems: z.array(
//     z.object({
//       key: z.string().min(1, "Key is required"),
//       value: z.string().min(1, "Value is required"),
//     })
//   ),
//   notes: z.string().min(1, "Notes are required"),
// });

// type FormData = z.infer<typeof schema>;

// const defaultValues: FormData = {
//   subtitle: "",
//   title: "",
//   icon: "",
//   show_line: false,
//   description: "",
//   tableItems: [],
//   notes: "",
// };

// const fetchAboutUsData = async (): Promise<FormData | null> => {
//   const { data, error } = await supabase.from("about_us").select("*").single();

//   if (error) {
//     console.error("Error fetching about us data:", error);
//     return null;
//   }
//   if (!data || Object.keys(data).length === 0) {
//     return defaultValues; // Return default values if no data
//   }

//   return data
//     ? {
//         ...data,
//         tableItems:
//           (data.table_items as { key: string; value: string }[]) ||
//           defaultValues.tableItems, // Cast to correct type || [],
//         // show_line: data.show_line,
//       }
//     : null;
// };

// export default function AboutUsForm() {
//   const queryClient = useQueryClient();
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<string | null>(null);
//   const methods = useForm();
//   const {
//     register,
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues,
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "tableItems",
//   });

//   const { data, isLoading, error } = useQuery({
//     queryKey: ["aboutUs"],
//     queryFn: fetchAboutUsData,
//     // enabled: false, // Disable automatic fetching
//   });

//   console.log(data, "about us data of db");

//   const mutation = useMutation({
//     mutationFn: async (formData: FormData) => {
//       if (editingProduct) {
//         const { error } = await supabase
//           .from("about_us")
//           .update({
//             subtitle: formData.subtitle,
//             title: formData.title,
//             icon: formData.icon,
//             show_line: formData.show_line,
//             description: formData.description,
//             table_items: formData.tableItems,
//             notes: formData.notes,
//           })
//           .eq("id", editingProduct);

//         if (error) {
//           throw new Error("Failed to save data. Please try again.");
//         }
//       } else {
//         const { error } = await supabase.from("about_us").insert({
//           subtitle: formData.subtitle,
//           title: formData.title,
//           icon: formData.icon,
//           show_line: formData.show_line,
//           description: formData.description,
//           table_items: formData.tableItems,
//           notes: formData.notes,
//         });

//         if (error) {
//           throw new Error("Failed to create data. Please try again.");
//         }
//       }
//     },
//     onSuccess: () => {
//       toast.success("Successfully saved data!");
//       queryClient.invalidateQueries({ queryKey: ["aboutUs"] });
//       setIsEditing(false);
//     },
//     onError: (error) => {
//       toast.error((error as Error).message);
//     },
//   });

//   //   const mutation = useMutation({
//   //     mutationFn: async (formData: FormData) => {
//   //       if (editingProduct) {
//   //         const { error } = await supabase
//   //           .from("about_us")
//   //           .update({
//   //             subtitle: formData.subtitle,
//   //             title: formData.title,
//   //             icon: formData.icon,
//   //             show_line: formData.show_line,
//   //             description: formData.description,
//   //             table_items: formData.tableItems,
//   //             notes: formData.notes,
//   //           })
//   //           .eq("id", editingProduct);

//   //         if (error) {
//   //           throw new Error("Failed to save data. Please try again.");
//   //         }
//   //       }
//   //     },
//   //     onSuccess: () => {
//   //       toast.success("Successfully saved data!");
//   //       queryClient.invalidateQueries({ queryKey: ["aboutUs"] });
//   //       setIsEditing(false);
//   //     },
//   //     onError: (error) => {
//   //       toast.error((error as Error).message);
//   //     },
//   //   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => {
//       const { error } = await supabase.from("about_us").delete().eq("id", id);
//       if (error) {
//         throw new Error("Failed to delete data. Please try again.");
//       }
//     },
//     onSuccess: () => {
//       toast.success("Successfully deleted data!");
//       queryClient.invalidateQueries({ queryKey: ["aboutUs"] });
//       reset(defaultValues);
//       setIsEditing(false);
//     },
//     onError: (error) => {
//       toast.error((error as Error).message);
//     },
//   });

//   const onSubmit = async (formData: FormData) => {
//     await mutation.mutateAsync(formData);
//   };

//   const handleEdit = (id: string) => {
//     setEditingProduct(id);
//     setIsEditing(true);
//     if (data) {
//       reset(data);
//     }
//     //
//   };

//   const handleDelete = (id: string) => {
//     // if (window.confirm("Are you sure you want to delete this data?")) {
//     deleteMutation.mutate(id);
//     // }
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {(error as Error).message}</div>;

//   return (
//     <div className="space-y-8">
//       {!isEditing && data ? (
//         <Card>
//           <CardContent className="pt-6">
//             <h2 className="text-2xl font-bold mb-4">{data.title}</h2>
//             <p className="mb-2">
//               <strong>Subtitle:</strong> {data.subtitle}
//             </p>
//             <p className="mb-2">
//               <strong>Icon:</strong> {data.icon}
//             </p>
//             <p className="mb-2">
//               <strong>Show Line:</strong> {data.show_line ? "Yes" : "No"}
//             </p>
//             <p className="mb-2">
//               <strong>Description:</strong> {data.description}
//             </p>
//             <div className="mb-2">
//               <strong>Table Items:</strong>
//               <ul>
//                 {data?.tableItems?.map((item, index) => (
//                   <li key={index}>
//                     {item.key}: {item.value}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <p>
//               <strong>Notes:</strong> {data.notes}
//             </p>
//           </CardContent>
//           <CardFooter className="flex justify-end space-x-2">
//             <Button onClick={() => handleEdit(data.id as string)}>Edit</Button>

//             <AlertDialog>
//               <AlertDialogTrigger asChild>
//                 <Button variant="destructive">Delete</Button>
//               </AlertDialogTrigger>
//               <AlertDialogContent>
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//                   <AlertDialogDescription>
//                     This action cannot be undone. This will permanently delete
//                     the product and remove it from our servers.
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                   <AlertDialogCancel>Cancel</AlertDialogCancel>
//                   <AlertDialogAction
//                     onClick={() => handleDelete(data.id as string)}
//                   >
//                     Delete
//                   </AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>

//             {/* <Button variant="destructive" onClick={handleDelete}>
//               Delete
//             </Button> */}
//           </CardFooter>
//         </Card>
//       ) : (
//         <FormProvider {...methods}>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="subtitle">Subtitle</Label>
//                 <Input id="subtitle" {...register("subtitle")} />
//                 {errors.subtitle && (
//                   <FormMessage>{errors.subtitle.message}</FormMessage>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="title">Title</Label>
//                 <Input id="title" {...register("title")} />
//                 {errors.title && (
//                   <FormMessage>{errors.title.message}</FormMessage>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="icon">Icon</Label>
//                 <Input id="icon" {...register("icon")} />
//                 {errors.icon && (
//                   <FormMessage>{errors.icon.message}</FormMessage>
//                 )}
//               </div>

//               <div className="flex items-center space-x-2">
//                 <Controller
//                   name="show_line"
//                   control={control}
//                   render={({ field }) => (
//                     <Checkbox
//                       id="show_line"
//                       checked={field.value}
//                       onCheckedChange={field.onChange}
//                     />
//                   )}
//                 />
//                 <Label htmlFor="show_line">Show Line</Label>
//               </div>

//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea id="description" {...register("description")} />
//                 {errors.description && (
//                   <FormMessage>{errors.description.message}</FormMessage>
//                 )}
//               </div>

//               <div>
//                 <Label>Table Items</Label>
//                 {fields.map((field, index) => (
//                   <div key={field.id} className="flex space-x-2 mt-2">
//                     <Input
//                       {...register(`tableItems.${index}.key`)}
//                       placeholder="Key"
//                     />
//                     <Input
//                       {...register(`tableItems.${index}.value`)}
//                       placeholder="Value"
//                     />
//                     <Button type="button" onClick={() => remove(index)}>
//                       Remove
//                     </Button>
//                   </div>
//                 ))}
//                 {errors.tableItems && (
//                   <FormMessage>
//                     All table items must have a key and value
//                   </FormMessage>
//                 )}
//                 <Button
//                   type="button"
//                   onClick={() => append({ key: "", value: "" })}
//                   className="mt-2"
//                 >
//                   Add Item
//                 </Button>
//               </div>

//               <div>
//                 <Label htmlFor="notes">Notes</Label>
//                 <Textarea id="notes" {...register("notes")} />
//                 {errors.notes && (
//                   <FormMessage>{errors.notes.message}</FormMessage>
//                 )}
//               </div>
//             </div>

//             <Button type="submit" disabled={mutation.isPending}>
//               {mutation.isPending ? "Saving..." : "Save"}
//             </Button>

//             {mutation.isError && (
//               <p className="text-red-500">
//                 Error: {(mutation.error as Error).message}
//               </p>
//             )}

//             {/* {mutation.isSuccess &&
//               (<p className="text-green-500">Data saved successfully!</p>)} */}
//           </form>
//         </FormProvider>
//       )}
//     </div>
//   );
// }

// "use client";
// import React, { useEffect } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/lib/supabase";
// import { DevTool } from "@hookform/devtools";
// import { toast } from "sonner";

// const schema = z.object({
//   subtitle: z.string().min(1, "Subtitle is required"),
//   title: z.string().min(1, "Title is required"),
//   icon: z.string().min(1, "Icon is required"),
//   show_line: z.boolean(),
//   description: z.string().min(1, "Description is required"),
//   tableItems: z.array(
//     z.object({
//       key: z.string().min(1, "Key is required"),
//       value: z.string().min(1, "Value is required"),
//     })
//   ),
//   notes: z.string().min(1, "Notes are required"),
// });

// type FormData = z.infer<typeof schema>;

// const defaultValues: FormData = {
//   subtitle: "Windward Sailing Club",
//   title: "About Us",
//   icon: "compass",
//   show_line: true,
//   description:
//     "Become a Windward Sailing Club member to take advantage of all our great Sailing opportunities. Don't hesitate to contact us with any questions about membership.",
//   tableItems: [
//     { key: "One-Time Initial Fee", value: "$550" },
//     { key: "Damage Deposit", value: "$500" },
//     { key: "One time member Fee", value: "$380" },
//     { key: "Certification Ride", value: "Free" },
//   ],
//   notes:
//     "Monthly dues total $190 ($80 per month administration fee plus the $110 membership fee that is applied towards boat use or charter).",
// };

// const fetchAboutUsData = async (): Promise<FormData> => {
//   const { data, error } = await supabase.from("about_us").select("*");

//   if (error) {
//     console.error("Error fetching about us data:", error);
//     throw new Error("Failed to load data. Please try again.");
//   }

//   if (!data) {
//     return defaultValues;
//   }

//   return {
//     ...data,
//     tableItems: data.table_items || (defaultValues.tableItems as any),
//     showLine: data.show_line,
//   };
// };

// export default function AboutUsForm() {
//   const queryClient = useQueryClient();

//   const {
//     register,
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues,
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "tableItems",
//   });

//   const { data, isLoading, error } = useQuery({
//     queryKey: ["aboutUs"],
//     queryFn: fetchAboutUsData,
//     // onSuccess: (data) => {
//     //   reset(data)
//     // },
//   });

//   useEffect(() => {
//     console.log("Data from useQuery fetch: ", data);
//     if (data) {
//       reset(data);
//     }
//   }, [data, reset]);

//   const mutation = useMutation({
//     mutationFn: async (formData: FormData) => {
//       const { error } = await supabase.from("about_us").upsert({
//         subtitle: formData.subtitle,
//         title: formData.title,
//         icon: formData.icon,
//         show_line: formData.show_line,
//         description: formData.description,
//         table_items: formData.tableItems,
//         notes: formData.notes,
//       });

//       if (error) {
//         toast.error("Failed to save data. Please try again.");

//         throw new Error("Failed to save data. Please try again.");
//       }
//     },
//     onSuccess: () => {
//       toast.success("Successfully saved data !!");
//       queryClient.invalidateQueries({ queryKey: ["aboutUs"] });
//     },
//   });

//   const onSubmit = async (data: FormData) => {
//     try {
//       console.log("Form submitted with data: ", data);
//       await mutation.mutateAsync(data);
//     } catch (error) {
//       toast.error("Failed to save data. Please try again.");
//       console.error("Error during form submission:", error);
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {(error as Error).message}</div>;

//   return (
//     <>
//       <DevTool placement="top-right" control={control} />

//       <form
//         onSubmit={(event) => {
//           try {
//             console.log("Submit button clicked!");
//             handleSubmit(onSubmit)(event);
//           } catch (error) {
//             console.log("Submit button clicked! Error");
//             console.error("Error in handleSubmit:", error); // Add error logging here
//           }
//         }}
//         className="space-y-8"
//       >
//         <div className="space-y-4">
//           <div>
//             <Label htmlFor="subtitle">Subtitle</Label>
//             <Input id="subtitle" {...register("subtitle")} />
//             {errors.subtitle && (
//               <p className="text-red-500">{errors.subtitle.message}</p>
//             )}
//           </div>

//           <div>
//             <Label htmlFor="title">Title</Label>
//             <Input id="title" {...register("title")} />
//             {errors.title && (
//               <p className="text-red-500">{errors.title.message}</p>
//             )}
//           </div>

//           <div>
//             <Label htmlFor="icon">Icon</Label>
//             <Input id="icon" {...register("icon")} />
//             {errors.icon && (
//               <p className="text-red-500">{errors.icon.message}</p>
//             )}
//           </div>

//           <div className="flex items-center space-x-2">
//             <Checkbox id="show_line" {...register("show_line")} />
//             <Label htmlFor="show_line">Show Line</Label>
//           </div>

//           <div>
//             <Label htmlFor="description">Description</Label>
//             <Textarea id="description" {...register("description")} />
//             {errors.description && (
//               <p className="text-red-500">{errors.description.message}</p>
//             )}
//           </div>

//           <div>
//             <Label>Table Items</Label>
//             {fields.map((field, index) => (
//               <div key={field.id} className="flex space-x-2 mt-2">
//                 <Input
//                   {...register(`tableItems.${index}.key`)}
//                   placeholder="Key"
//                 />
//                 <Input
//                   {...register(`tableItems.${index}.value`)}
//                   placeholder="Value"
//                 />
//                 <Button type="button" onClick={() => remove(index)}>
//                   Remove
//                 </Button>
//               </div>
//             ))}
//             <Button
//               type="button"
//               onClick={() => append({ key: "", value: "" })}
//               className="mt-2"
//             >
//               Add Item
//             </Button>
//           </div>

//           <div>
//             <Label htmlFor="notes">Notes</Label>
//             <Textarea id="notes" {...register("notes")} />
//             {errors.notes && (
//               <p className="text-red-500">{errors.notes.message}</p>
//             )}
//           </div>
//         </div>

//         <Button type="submit" disabled={mutation.isPending}>
//           {mutation.isPending ? "Saving..." : "Save"}
//         </Button>

//         {mutation.isError && (
//           <p className="text-red-500">
//             Error: {(mutation.error as Error).message}
//           </p>
//         )}

//         {mutation.isSuccess && (
//           <p className="text-green-500">Data saved successfully!</p>
//         )}
//       </form>
//     </>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { supabase } from "@/lib/supabase";
// import { DevTool } from "@hookform/devtools";

// const schema = z.object({
//   subtitle: z.string().min(1, "Subtitle is required"),
//   title: z.string().min(1, "Title is required"),
//   icon: z.string().min(1, "Icon is required"),
//   showLine: z.boolean(),
//   description: z.string().min(1, "Description is required"),
//   tableItems: z.array(
//     z.object({
//       key: z.string().min(1, "Key is required"),
//       value: z.string().min(1, "Value is required"),
//     })
//   ),
//   notes: z.string().min(1, "Notes are required"),
// });

// type FormData = z.infer<typeof schema>;

// const defaultValues: FormData = {
//   subtitle: "Windward Sailing Club",
//   title: "About Us",
//   icon: "compass",
//   showLine: true,
//   description:
//     "Become a Windward Sailing Club member to take advantage of all our great Sailing opportunities. Don't hesitate to contact us with any questions about membership.",
//   tableItems: [
//     { key: "One-Time Initial Fee", value: "$550" },
//     { key: "Damage Deposit", value: "$500" },
//     { key: "One time member Fee", value: "$380" },
//     { key: "Certification Ride", value: "Free" },
//   ],
//   notes:
//     "Monthly dues total $190 ($80 per month administration fee plus the $110 membership fee that is applied towards boat use or charter).",
// };

// export default function AboutUsForm() {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const {
//     register,
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues,
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "tableItems",
//   });

//   useEffect(() => {
//     fetchAboutUsData();
//   }, []);

//   const fetchAboutUsData = async () => {
//     setLoading(true);
//     setError(null);
//     const { data, error } = await supabase
//       .from("about_us")
//       .select("*")
//       .single();

//     if (error) {
//       console.error("Error fetching about us data:", error);
//       setError("Failed to load data. Please try again.");
//     } else if (data) {
//       reset({
//         ...data,
//         tableItems: data.table_items as any,
//         showLine: data.show_line,
//       });
//     }
//     setLoading(false);
//   };

//   const onSubmit = async (data: FormData) => {
//     setLoading(true);
//     setError(null);
//     const { error } = await supabase.from("about_us").upsert({
//       subtitle: data.subtitle,
//       title: data.title,
//       icon: data.icon,
//       show_line: data.showLine,
//       description: data.description,
//       table_items: data.tableItems,
//       notes: data.notes,
//     });

//     if (error) {
//       console.error("Error saving about us data:", error);
//       setError("Failed to save data. Please try again.");
//     } else {
//       console.log("Data saved successfully");
//     }
//     setLoading(false);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <>
//       <DevTool placement="top-right" control={control} />
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//         <div className="space-y-4">
//           <div>
//             <Label htmlFor="subtitle">Subtitle</Label>
//             <Input id="subtitle" {...register("subtitle")} />
//             {errors.subtitle && (
//               <p className="text-red-500">{errors.subtitle.message}</p>
//             )}
//           </div>

//           <div>
//             <Label htmlFor="title">Title</Label>
//             <Input id="title" {...register("title")} />
//             {errors.title && (
//               <p className="text-red-500">{errors.title.message}</p>
//             )}
//           </div>

//           <div>
//             <Label htmlFor="icon">Icon</Label>
//             <Input id="icon" {...register("icon")} />
//             {errors.icon && (
//               <p className="text-red-500">{errors.icon.message}</p>
//             )}
//           </div>

//           <div className="flex items-center space-x-2">
//             <Checkbox id="showLine" {...register("showLine")} />
//             <Label htmlFor="showLine">Show Line</Label>
//           </div>

//           <div>
//             <Label htmlFor="description">Description</Label>
//             <Textarea id="description" {...register("description")} />
//             {errors.description && (
//               <p className="text-red-500">{errors.description.message}</p>
//             )}
//           </div>

//           <div>
//             <Label>Table Items</Label>
//             {fields?.map((field, index) => (
//               <div key={field.id} className="flex space-x-2 mt-2">
//                 <Input
//                   {...register(`tableItems.${index}.key`)}
//                   placeholder="Key"
//                 />
//                 <Input
//                   {...register(`tableItems.${index}.value`)}
//                   placeholder="Value"
//                 />
//                 <Button type="button" onClick={() => remove(index)}>
//                   Remove
//                 </Button>
//               </div>
//             ))}
//             <Button
//               type="button"
//               onClick={() => append({ key: "", value: "" })}
//               className="mt-2"
//             >
//               Add Item
//             </Button>
//           </div>

//           <div>
//             <Label htmlFor="notes">Notes</Label>
//             <Textarea id="notes" {...register("notes")} />
//             {errors.notes && (
//               <p className="text-red-500">{errors.notes.message}</p>
//             )}
//           </div>
//         </div>

//         <Button type="submit" disabled={loading}>
//           {loading ? "Saving..." : "Save"}
//         </Button>
//       </form>
//     </>
//   );
// }
