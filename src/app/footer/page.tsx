"use client";
import { supabase } from "@/lib/supabase";
import { Upload } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

export interface NavigationLink {
  text: string;
  url: string;
}
export interface FooterContent {
  id: string;
  logo_url: string;
  footer_image_url: string;
  club_name: string;
  address: string;
  address_label: string;
  service_area: string;
  service_area_label: string;
  navigation_links: NavigationLink[];
  copyright_text: string;
}

export default function FooterEditForm() {
  const [footerContent, setFooterContent] = useState<FooterContent>({
    id: "",
    logo_url: "",
    footer_image_url: "",
    club_name: "",
    address: "",
    address_label: "Address",
    service_area: "",
    service_area_label: "Service Area",
    navigation_links: [],
    copyright_text: "",
  });

  useEffect(() => {
    fetchFooterContent();
  }, []);

  const fetchFooterContent = async () => {
    const { data, error } = await supabase
      .from("footer_content")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching footer content:", error.message);
    } else if (data) {
      setFooterContent(data as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("footer_content")
      .upsert(footerContent as any)
      .select();

    if (error) {
      console.error("Error updating footer content:", error);
    } else {
      console.log("Footer content updated successfully:", data);
      toast.success("Footer content updated successfully!");
    }
  };

  const handleNavigationLinkChange = (
    index: number,
    field: keyof NavigationLink,
    value: string
  ) => {
    const updatedLinks = [...footerContent.navigation_links];

    updatedLinks[index] = { ...updatedLinks[index], [field]: value };

    setFooterContent({ ...footerContent, navigation_links: updatedLinks });
  };

  const addNavigationLink = () => {
    setFooterContent({
      ...footerContent,
      navigation_links: [
        ...footerContent.navigation_links,
        { text: "", url: "" },
      ],
    });
  };

  const removeNavigationLink = (index: number) => {
    const updatedLinks = footerContent.navigation_links.filter(
      (_, i) => i !== index
    );
    setFooterContent({ ...footerContent, navigation_links: updatedLinks });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Footer Content</h1>

      <div>
        <label
          htmlFor="logo_url"
          className="block text-sm font-medium text-gray-700"
        >
          Logo URL:
        </label>
        <input
          type="text"
          id="logo_url"
          value={footerContent.logo_url}
          onChange={(e) =>
            setFooterContent({ ...footerContent, logo_url: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="footer_image_url"
          className="block text-sm font-medium text-gray-700"
        >
          Footer Image URL:
        </label>
        <input
          type="text"
          id="footer_image_url"
          value={footerContent?.footer_image_url}
          onChange={(e) =>
            setFooterContent({
              ...footerContent,
              footer_image_url: e.target.value,
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="club_name"
          className="block text-sm font-medium text-gray-700"
        >
          Club Name:
        </label>
        <input
          type="text"
          id="club_name"
          value={footerContent.club_name}
          onChange={(e) =>
            setFooterContent({ ...footerContent, club_name: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="address_label"
          className="block text-sm font-medium text-gray-700"
        >
          Address Label:
        </label>
        <input
          type="text"
          id="address_label"
          value={footerContent.address_label}
          onChange={(e) =>
            setFooterContent({
              ...footerContent,
              address_label: e.target.value,
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          Address:
        </label>
        <textarea
          id="address"
          value={footerContent.address}
          onChange={(e) =>
            setFooterContent({ ...footerContent, address: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          rows={3}
        />
      </div>

      <div>
        <label
          htmlFor="service_area_label"
          className="block text-sm font-medium text-gray-700"
        >
          Service Area Label:
        </label>
        <input
          type="text"
          id="service_area_label"
          value={footerContent.service_area_label}
          onChange={(e) =>
            setFooterContent({
              ...footerContent,
              service_area_label: e.target.value,
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="service_area"
          className="block text-sm font-medium text-gray-700"
        >
          Service Area:
        </label>
        <textarea
          id="service_area"
          value={footerContent.service_area}
          onChange={(e) =>
            setFooterContent({ ...footerContent, service_area: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Navigation Links:
        </label>
        {footerContent?.navigation_links?.map((link, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              value={link.text}
              onChange={(e) =>
                handleNavigationLinkChange(index, "text", e.target.value)
              }
              placeholder="Link Text"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <input
              type="text"
              value={link.url}
              onChange={(e) =>
                handleNavigationLinkChange(index, "url", e.target.value)
              }
              placeholder="Link URL"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <button
              type="button"
              onClick={() => removeNavigationLink(index)}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addNavigationLink}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Link
        </button>
      </div>

      <div>
        <label
          htmlFor="copyright_text"
          className="block text-sm font-medium text-gray-700"
        >
          Copyright Text:
        </label>
        <input
          type="text"
          id="copyright_text"
          value={footerContent.copyright_text}
          onChange={(e) =>
            setFooterContent({
              ...footerContent,
              copyright_text: e.target.value,
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Update Footer
      </button>
    </form>
  );
}

// "use client";
// import { supabase } from "@/lib/supabase";
// import React, { useState, useEffect } from "react";

// interface FooterContent {
//     id: string;
//     logo_url: string;
//     footer_image_url: string;
//     club_name: string;
//     address: string;
//     address_label: string;
//     service_area: string;
//     service_area_label: string;
//     navigation_links: { text: string; url: string }[];
//     copyright_text: string;
//   }

// export default function FooterEditForm() {
//     const [footerContent, setFooterContent] = useState<FooterContent>({
//         id: '',
//         logo_url: '',
//         footer_image_url: '',
//         club_name: '',
//         address: '',
//         address_label: 'Address',
//         service_area: '',
//         service_area_label: 'Service Area',
//         navigation_links: [],
//         copyright_text: '',
//       });

//   useEffect(() => {
//     fetchFooterContent();
//   }, []);

//   const fetchFooterContent = async () => {
//     const { data, error } = await supabase
//       .from("footer_content")
//       .select("*")
//       .single();

//     if (error) {
//       console.error("Error fetching footer content:", error);
//     } else if (data) {
//       setFooterContent(data);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const { data, error } = await supabase
//       .from("footer_content")
//       .upsert(footerContent)
//       .select();

//     if (error) {
//       console.error("Error updating footer content:", error);
//     } else {
//       console.log("Footer content updated successfully:", data);
//       alert("Footer content updated successfully!");
//     }
//   };

//   const handleNavigationLinkChange = (
//     index: number,
//     field: "text" | "url",
//     value: string
//   ) => {
//     const updatedLinks = [...footerContent.navigation_links];
//     updatedLinks[index] = { ...updatedLinks[index], [field]: value };
//     setFooterContent({ ...footerContent, navigation_links: updatedLinks });
//   };

//   const addNavigationLink = () => {
//     setFooterContent({
//       ...footerContent,
//       navigation_links: [
//         ...footerContent.navigation_links,
//         { text: "", url: "" },
//       ],
//     });
//   };

//   const removeNavigationLink = (index: number) => {
//     const updatedLinks = footerContent.navigation_links.filter(
//       (_, i) => i !== index
//     );
//     setFooterContent({ ...footerContent, navigation_links: updatedLinks });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Edit Footer Content</h1>

//       <div>
//         <label
//           htmlFor="logo_url"
//           className="block text-sm font-medium text-gray-700"
//         >
//           Logo URL:
//         </label>
//         <input
//           type="text"
//           id="logo_url"
//           value={footerContent.logo_url}
//           onChange={(e) =>
//             setFooterContent({ ...footerContent, logo_url: e.target.value })
//           }
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//         />
//       </div>

//       <div>
//         <label
//           htmlFor="club_name"
//           className="block text-sm font-medium text-gray-700"
//         >
//           Club Name:
//         </label>
//         <input
//           type="text"
//           id="club_name"
//           value={footerContent.club_name}
//           onChange={(e) =>
//             setFooterContent({ ...footerContent, club_name: e.target.value })
//           }
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//         />
//       </div>

//       <div>
//         <label
//           htmlFor="address"
//           className="block text-sm font-medium text-gray-700"
//         >
//           Address:
//         </label>
//         <textarea
//           id="address"
//           value={footerContent.address}
//           onChange={(e) =>
//             setFooterContent({ ...footerContent, address: e.target.value })
//           }
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           rows={3}
//         />
//       </div>

//       <div>
//         <label
//           htmlFor="service_area"
//           className="block text-sm font-medium text-gray-700"
//         >
//           Service Area:
//         </label>
//         <textarea
//           id="service_area"
//           value={footerContent.service_area}
//           onChange={(e) =>
//             setFooterContent({ ...footerContent, service_area: e.target.value })
//           }
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           rows={3}
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Navigation Links:
//         </label>
//         {footerContent.navigation_links.map((link, index) => (
//           <div key={index} className="flex space-x-2 mb-2">
//             <input
//               type="text"
//               value={link.text}
//               onChange={(e) =>
//                 handleNavigationLinkChange(index, "text", e.target.value)
//               }
//               placeholder="Link Text"
//               className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//             />
//             <input
//               type="text"
//               value={link.url}
//               onChange={(e) =>
//                 handleNavigationLinkChange(index, "url", e.target.value)
//               }
//               placeholder="Link URL"
//               className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//             />
//             <button
//               type="button"
//               onClick={() => removeNavigationLink(index)}
//               className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//             >
//               Remove
//             </button>
//           </div>
//         ))}
//         <button
//           type="button"
//           onClick={addNavigationLink}
//           className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//         >
//           Add Link
//         </button>
//       </div>

//       <div>
//         <label
//           htmlFor="copyright_text"
//           className="block text-sm font-medium text-gray-700"
//         >
//           Copyright Text:
//         </label>
//         <input
//           type="text"
//           id="copyright_text"
//           value={footerContent.copyright_text}
//           onChange={(e) =>
//             setFooterContent({
//               ...footerContent,
//               copyright_text: e.target.value,
//             })
//           }
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//         />
//       </div>

//       <button
//         type="submit"
//         className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//       >
//         Update Footer
//       </button>
//     </form>
//   );
// }
