import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  fetchSectionsAndNavItemsDashboard,
  fetchUserSelectionsSections,
} from "@/services/dashboard-services";
import { fetchSectionsDashboard } from "@/lib/queries/dashboard-queries";
import { fetchSectionsAndNavItems } from "@/app/dashboard/page";
import { query } from "@/lib/db";

const fetchUserSelections = async (sectionId: any) => {
  const { data, error } = await supabase
    .from("user_selections")
    .select("*")
    .eq("section_id", sectionId);

  if (error) throw new Error(error.message);
  return data;
};

const updateUserSelection = async ({
  sectionId,
  productId,
  isSelected,
  isExternalImage,
}: any) => {
  if (isSelected) {
    const { error } = await supabase.from("user_selections").upsert({
      section_id: sectionId,
      product_id: productId,
      is_external_image: isExternalImage,
    });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("user_selections")
      .delete()
      .match({ section_id: sectionId, product_id: productId });
    if (error) throw new Error(error.message);
  }
};

const updateExternalImageStatus = async ({
  sectionId,
  productId,
  isExternalImage,
}: any) => {
  try {
    const { error } = await supabase
      .from("user_selections")
      .update({ is_external_image: isExternalImage })
      .match({ section_id: sectionId, product_id: productId });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error updating external image status:", error);
    throw error;
  }
};
// const fetchBoatsNavItem = async () => {
//   const { data, error } = await supabase
//     .from("nav_items")
//     .select(
//       `
//       id,
//       name,
//       nav_sections (
//         id,
//         name,
//         products (
//           id,
//           name,
//           product_details (
//             images
//           )
//         )
//       )
//     `
//     )
//     .eq("name", "Boats")
//     .single();

//   if (error) throw new Error(error.message);
//   return data;
// };

export async function fetchBoatsNavItem() {
  const sql = `
    SELECT 
      ni.id AS nav_item_id,
      ni.name AS nav_item_name,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', ns.id,
          'name', ns.name,
          'products', COALESCE(
            (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', p.id,
                  'name', p.name,
                  'product_details', JSON_BUILD_OBJECT('images', pd.images)
                )
              )
              FROM products p
              LEFT JOIN product_details pd ON p.id = pd.product_id
              WHERE p.nav_section_id = ns.id
            ), '[]'::JSON
          )
        )
      ) AS nav_sections
    FROM nav_items ni
    LEFT JOIN nav_sections ns ON ni.id = ns.parent_id
    WHERE ni.name = 'Boats'
    GROUP BY ni.id, ni.name;
  `;

  try {
    const result = await query(sql);
    return result?.[0]; // Assuming single result for "Boats"
  } catch (error) {
    console.error("Error fetching Boats nav item:", error);
    throw error;
  }
}

const SectionProducts = ({ sectionId, benefitsId, navItems }: any) => {
  const queryClient = useQueryClient();
  console.log(navItems);
  console.log("checking ids", sectionId, benefitsId, sectionId === benefitsId);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const { data: userSelections = [] } = useQuery({
    queryKey: ["userSelections", sectionId],
    queryFn: () => fetchUserSelectionsSections(sectionId),
  });

  console.log(userSelections);
  const { data: boatsNavItem } = useQuery({
    queryKey: ["sectionsAndNav"],
    queryFn: fetchBoatsNavItem,
  });

  console.log(boatsNavItem);
  // debugger;

  const mutation = useMutation({
    mutationFn: updateUserSelection,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userSelections", sectionId],
      });
      toast.success("Selection updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating selection: ${error.message}`);
    },
  });
  const imageMutation = useMutation({
    mutationFn: updateExternalImageStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userSelections", sectionId],
      });
      toast.success("Selection updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating selection: ${error.message}`);
    },
  });

  const handleCheckboxChange = (productId: any, isChecked: any) => {
    mutation.mutate({
      sectionId,
      productId,
      isSelected: isChecked,
      isExternalImage: false,
    });
  };

  const handleSwitchChange = (productId: any, isExternalImage: any) => {
    console.log("checking debugging", isExternalImage);
    imageMutation.mutate({ sectionId, productId, isExternalImage });
    // updateExternalImageStatus(sectionId, productId, isExternalImage);
    // mutation.mutate({
    //   sectionId,
    //   productId,
    //   isSelected: true,
    //   isExternalImage,
    // });
  };

  if (!boatsNavItem) return <div>Loading...</div>;

  return (
    <Accordion
      type="multiple"
      value={expandedSections}
      onValueChange={setExpandedSections}
      className="w-full"
    >
      {(boatsNavItem as any)?.nav_sections?.map((navSection: any) => {
        console.log("productsssssssssss", navSection);
        return (
          <AccordionItem key={navSection.id} value={navSection.id}>
            <AccordionTrigger>{navSection.name}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {navSection?.products?.map((product: any) => {
                  console.log("productsssssssssss", product);
                  const userSelection = userSelections?.find(
                    (s: any) => s.product_id === product.id
                  );

                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={!!userSelection}
                          onCheckedChange={(isChecked) =>
                            handleCheckboxChange(product.id, isChecked)
                          }
                        />
                        <span>{product.name}</span>
                      </div>
                      {sectionId === benefitsId && (
                        <Switch
                          checked={
                            (userSelection as any)?.is_external_image as boolean
                          }
                          onCheckedChange={(isExternalImage) =>
                            handleSwitchChange(product.id, isExternalImage)
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default SectionProducts;
