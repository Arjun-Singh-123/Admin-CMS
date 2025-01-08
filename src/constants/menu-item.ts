import { FileText, LayoutDashboard, Settings, Users } from "lucide-react";

export const menuGroups = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    menuItems: [
      {
        label: "Login",
        route: "/login",
      },
      {
        label: "Dashboard",
        route: "/dashboard",
      },
    ],
  },
  {
    name: "Posts",
    icon: FileText,
    menuItems: [
      {
        label: "All Posts",
        route: "/posts/all",
      },
      {
        label: "Add a New Post",
        route: "/posts/add",
      },
      {
        label: "Categories",
        route: "/posts/categories",
      },
    ],
  },
  {
    name: "Pages",
    icon: FileText,
    menuItems: [
      {
        label: "All Pages",
        route: "/Pages/all",
      },
      {
        label: "Add a New Page",
        route: "/Pages/add",
      },
      {
        label: "Categories",
        route: "/Pages/categories",
      },
    ],
  },
  {
    name: "Users",
    icon: Users,
    menuItems: [
      {
        label: "All Users",
        route: "/users/all",
      },
      {
        label: "Add a New User",
        route: "/users/add",
      },
      {
        label: "Profile",
        route: "/users/profile",
      },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    menuItems: [
      {
        label: "Header",
        route: " /header",
      },
      {
        label: "Footer",
        route: " /dynamic-footer",
      },
      {
        label: "Toggle Sections",
        route: "/toggle-components",
      },
      {
        label: "General",
        route: "/settings/general",
      },

      {
        label: "Post Types",
        route: "/settings/post-types",
      },
      {
        label: "Products",
        route: "/prod",
      },
      {
        label: "Membership Fees",
        route: "/membership-cms",
      },
      {
        label: "Rentals Fee",
        route: "/rentals",
      },
      {
        label: "Contacts-Info",
        route: "/contacts-info",
      },
    ],
  },
  // {
  //   name: "Others",
  //   icon: BarChart2,
  //   menuItems: [
  //     {
  //       label: "Chart",
  //       route: "/chart",
  //     },
  //     {
  //       label: "UI Elements",
  //       route: "#",
  //       children: [
  //         { label: "Alerts", route: "/ui/alerts" },
  //         { label: "Buttons", route: "/ui/buttons" },
  //       ],
  //     },
  //     {
  //       label: "Authentication",
  //       route: "#",
  //       children: [
  //         { label: "Sign In", route: "/auth/signin" },
  //         { label: "Sign Up", route: "/auth/signup" },
  //       ],
  //     },
  //   ],
  // },
];
