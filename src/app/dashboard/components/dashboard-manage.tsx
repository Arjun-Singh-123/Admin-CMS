// "use client";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   keepPreviousData,
//   useMutation,
//   useQuery,
//   useQueryClient,
// } from "@tanstack/react-query";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { supabase } from "@/lib/supabase";
// import SectionProducts from "@/components/section-products-dashboard";
// import { Switch } from "@/components/ui/switch";
// import { toast } from "sonner";
// import { StaticSectionEditor } from "@/components/static-section-editor";
// import AboutEditor from "@/components/about-section-editor";
// import StatsManager from "@/components/stats-section-editor";
// import {
//   fetchSectionsAndNavItemsDashboard,
//   updateSectionStatusDashboard,
// } from "@/services/dashboard-services";
// import {
//   fetchSectionsDashboard,
//   updateSection,
// } from "@/lib/queries/dashboard-queries";

// export const fetchSectionsAndNavItems = async () => {
//   const { data: sections, error: sectionsError } = await supabase
//     .from("sections")
//     .select("*")
//     .order("display_order", { ascending: true });

//   if (sectionsError) throw new Error(sectionsError.message);

//   const { data: navItems, error: navItemsError } = await supabase
//     .from("nav_items")
//     .select(
//       `
//       id,
//       name,
//       href,
//       status,
//       nav_sections (
//         id,
//         name,
//         href,
//         status,
//         products (
//           id,
//           name,
//           href,
//           product_details (*)
//         )
//       )
//     `
//     )
//     .eq("name", "Boats")
//     .order("priority", { ascending: true });

//   if (navItemsError) throw new Error(navItemsError.message);

//   return { sections, navItems };
// };
// // const updateSectionStatus = async ({ sectionId, status }:any) => {
// //   const { error } = await supabase
// //     .from("sections")
// //     .update({ status })
// //     .eq("id", sectionId);

// //   if (error) throw new Error(error.message);
// // };

// function Dashboard() {
//   const queryClient = useQueryClient();
//   const [benefitsId, setBenefitsId] = useState(null);

//   const { data, isLoading, error } = useQuery({
//     queryKey: ["sectionsAndNavItems"],
//     queryFn: fetchSectionsAndNavItems,
//     placeholderData: keepPreviousData,

//     initialDataUpdatedAt: () =>
//       queryClient.getQueryState(["sectionsAndNavItems"])?.dataUpdatedAt,
//   });

//   console.log(data);

//   const statusMutation = useMutation({
//     mutationFn: updateSection,
//     // onMutate: async ({ sectionId, status }) => {
//     //   // Optimistically update the status
//     //   await queryClient.cancelQueries({ queryKey: ["sections"] });

//     //   const previousSections = queryClient.getQueryData(["sections"]);

//     //   queryClient.setQueryData(["sections"], (old) =>
//     //     old?.map((section) =>
//     //       section.id === sectionId ? { ...section, status } : section
//     //     )
//     //   );

//     //   return { previousSections };
//     // },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["sectionsAndNavItems"] });

//       toast.success("Section status updated successfully");
//     },
//     onError: (error, variables, context) => {
//       // Rollback to previous state on error
//       // queryClient.setQueryData(["sections"], context?.previousSections);
//       toast.error(`Error updating section status: ${error.message}`);
//     },
//   });

//   useEffect(() => {
//     if (data) {
//       const id =
//         data?.sections?.find((item) => item.name === "Benefits")?.id || null;
//       setBenefitsId(id);
//     }
//   }, [data]); // Only runs when data changes

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   const { sections, navItems } = data;
//   console.log(data);

//   const handleStatusChange = (sectionId: any, status: any) => {
//     statusMutation.mutate({ sectionId, status });
//   };

//   const dynamicSections = sections?.filter(
//     (section: any) => section.type === "dynamic"
//   );
//   const staticSections = sections?.filter(
//     (section: any) => section.is_visible && section.type === "static"
//   );

"use client";
import React, { useEffect, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import {
  fetchDashBoardSectionsAndNavItems,
  updateDashBoardSectionStatus,
} from "@/services/dashboard-services";
import SectionProducts from "@/components/section-products-dashboard";
import AboutEditor from "@/components/about-section-editor";
import StatsManager from "@/components/stats-section-editor";
import { Switch } from "@/components/ui/switch";
import BenefitsManagement from "@/app/benefits/page";

function Dashboard() {
  const queryClient = useQueryClient();
  const [benefitsId, setBenefitsId] = useState(null);
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["sectionsAndNavItems"],
    queryFn: fetchDashBoardSectionsAndNavItems,
    placeholderData: keepPreviousData,

    initialDataUpdatedAt: () =>
      queryClient.getQueryState(["sectionsAndNavItems"])?.dataUpdatedAt,
  });

  const statusMutation = useMutation({
    mutationFn: updateDashBoardSectionStatus,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectionsAndNavItems"] });

      toast.success("Section status updated successfully");
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating section status: ${error.message}`);
    },
  });

  useEffect(() => {
    if (data) {
      const id =
        data?.sections?.find((item) => item.name === "Benefits")?.id || null;
      setBenefitsId(id as any);
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  //   const { sections , navItems } = data;

  const handleStatusChange = (sectionId: any, status: any) => {
    statusMutation.mutate({ sectionId, status });
  };

  const dynamicSections = data?.sections.filter(
    (section: any) => section.type === "dynamic"
  );
  const staticSections = data?.sections.filter(
    (section: any) => section.type === "static"
  );

  return (
    <Accordion type="single" collapsible className="w-full">
      {dynamicSections?.map((section: any) => (
        <AccordionItem key={section.id} value={section.id}>
          <AccordionTrigger className="text-xl font-bold">
            <div className="flex items-center justify-between w-full">
              <span>{section.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-normal">Publish</span>
                <Switch
                  checked={section.status === "published"}
                  onCheckedChange={(isPublished) =>
                    handleStatusChange(
                      section.id,
                      isPublished ? "published" : "draft"
                    )
                  }
                />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SectionProducts sectionId={section.id} benefitsId={benefitsId} />
          </AccordionContent>
        </AccordionItem>
      ))}
      {staticSections?.map((section: any) => (
        <AccordionItem key={section.id} value={section.id}>
          <AccordionTrigger className="text-xl font-bold">
            <span className=" ">{section.name}</span>
          </AccordionTrigger>

          <AccordionContent>
            {/* <StaticSectionEditor key={section.id} section={section} /> */}

            {section.name === "About" && (
              <AboutEditor
              // sectionId={section.id}
              // initialData={section.content || {}}
              />
            )}
            {section.name === "Statistics" && (
              <StatsManager
              // sectionId={section.id}
              // initialData={section.content || { stats: [] }}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      ))}

      <AccordionItem value="item-1">
        <AccordionTrigger className="text-xl font-bold">
          <span className=" ">Manage benefit details</span>
        </AccordionTrigger>

        <AccordionContent>
          <BenefitsManagement />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default Dashboard;

// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Users, DollarSign, ShoppingCart, BarChart } from "lucide-react";

// export default function SimpleAdminDashboard() {
//   const dashboardItems = [
//     { title: "Total Users", value: "1,234", icon: Users },
//     { title: "Revenue", value: "$10,234", icon: DollarSign },
//     { title: "Orders", value: "356", icon: ShoppingCart },
//     { title: "Conversion Rate", value: "3.2%", icon: BarChart },
//   ];

//   return (
//     <div className="min-h-screen bg-white text-black p-8">
//       <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

//       <p className="text-xl mb-8 max-w-3xl">
//         Welcome to your streamlined admin interface. This dashboard provides a
//         quick overview of key metrics, allowing you to monitor your business
//         performance at a glance. The minimalist black and white design ensures
//         clarity and focus on the essential data.
//       </p>

//       {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {dashboardItems.map((item, index) => (
//           <Card key={index} className="border-2 border-black">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 {item.title}
//               </CardTitle>
//               <item.icon className="h-4 w-4 text-black" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{item.value}</div>
//             </CardContent>
//           </Card>
//         ))}
//       </div> */}
//     </div>
//   );
// }
