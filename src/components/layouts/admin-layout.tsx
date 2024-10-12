"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Settings,
  User,
  Home,
  FileText,
  Users,
  BarChart2,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";

const menuGroups = [
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

// const MenuItem = ({
//   item,
//   isActive,
//   onClick,
//   icon: Icon,
//   isSidebarOpen,
// }: any) => {
//   // debugger;
//   const [isOpen, setIsOpen] = useState(false);
//   const hasChildren = item.children && item.children.length > 0;

//   const toggleSubmenu = (e: any) => {
//     e.preventDefault();
//     setIsOpen(!isOpen);
//   };

//   return (
//     <div>
//       <Link
//         href={item.route}
//         className={`flex items-center px-4 py-2 text-sm ${
//           isActive
//             ? "bg-gray-700 text-white"
//             : "text-gray-300 hover:bg-gray-700 hover:text-white"
//         }`}
//         onClick={hasChildren ? toggleSubmenu : onClick}
//       >
//         {Icon && <Icon className="w-5 h-5 mr-2" />}
//         {isSidebarOpen && <span className="flex-grow">{item.label}</span>}{" "}
//         {hasChildren && (
//           <span className="ml-2">
//             {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//           </span>
//         )}
//       </Link>
//       {hasChildren && isOpen && (
//         <div className="ml-4">
//           {item.children.map((child: any) => (
//             <MenuItem
//               key={child.route}
//               item={child}
//               isActive={false}
//               onClick={onClick}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const MenuItem = ({
//   item,
//   isActive,
//   onClick,
//   icon: Icon,
//   isSidebarOpen,
// }: any) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const hasChildren = item.menuItems && item.menuItems.length > 0;

//   const toggleSubmenu = (e: React.MouseEvent) => {
//     e.preventDefault();
//     setIsOpen(!isOpen);
//     if (!isOpen && hasChildren) {
//       onClick(item.menuItems[0].route);
//     }
//   };

//   return (
//     <div>
//       <Link
//         href={hasChildren ? "#" : item.route}
//         className={`flex items-center px-4 py-2 text-sm ${
//           isActive
//             ? "bg-gray-700 text-white"
//             : "text-gray-300 hover:bg-gray-700 hover:text-white"
//         }`}
//         onClick={toggleSubmenu}
//       >
//         {Icon && <Icon className="w-5 h-5 mr-2" />}
//         {isSidebarOpen && (
//           <span className="flex-grow">{item.name || item.label}</span>
//         )}
//         {hasChildren && (
//           <ChevronDown
//             size={16}
//             className={`ml-2 transition-transform ${
//               isOpen ? "rotate-180" : ""
//             }`}
//           />
//         )}
//       </Link>
//       {hasChildren && isOpen && (
//         <div className="ml-4">
//           {item.menuItems.map((child: any) => (
//             <MenuItem
//               key={child.route}
//               item={child}
//               isActive={false}
//               onClick={onClick}
//               isSidebarOpen={isSidebarOpen}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

const MenuItem = ({
  item,
  isActive,
  onClick,
  icon: Icon,
  isSidebarOpen,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const hasChildren = item.menuItems && item.menuItems.length > 0;

  const toggleSubmenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
    if (hasChildren) {
      // router.push(item.menuItems[0].route);
      onClick(item.menuItems[0].route);
    } else {
      router.push(item.route);
      onClick(item.route);
    }
  };

  return (
    <div>
      <Link
        href={hasChildren ? "#" : item.route}
        className={`flex items-center px-4 py-2 text-sm ${
          isActive
            ? "bg-gray-700 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
        onClick={toggleSubmenu}
      >
        {Icon && <Icon className="w-5 h-5 mr-2" />}
        {isSidebarOpen && (
          <span className="flex-grow">{item.name || item.label}</span>
        )}
        {hasChildren && (
          <ChevronDown
            size={16}
            className={`ml-2 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </Link>
      {hasChildren && isOpen && (
        <div className="ml-4">
          {item.menuItems.map((child: any) => (
            <MenuItem
              key={child.route}
              item={child}
              isActive={child.route === pathname}
              onClick={onClick}
              isSidebarOpen={isSidebarOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeRoute, setActiveRoute] = useState(pathname);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuItemClick = (route: string) => {
    setActiveRoute(route);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={`bg-gray-800 text-white transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="p-4 flex justify-between items-center">
          {isSidebarOpen && (
            <div className="flex items-center">
              <Image
                src="/images/logo.svg"
                alt="TailAdmin Logo"
                width={32}
                height={32}
                className="mr-2"
              />
              <h1 className="text-2xl font-bold">Admin</h1>
            </div>
          )}
        </div>
        <nav className="mt-8">
          {menuGroups?.map((group) => (
            <MenuItem
              key={group.name}
              item={group}
              isActive={group.menuItems.some(
                (item) => item.route === activeRoute
              )}
              onClick={handleMenuItemClick}
              icon={group.icon}
              isSidebarOpen={isSidebarOpen}
            />
          ))}
        </nav>
      </aside>
      {/* <aside
        className={`bg-gray-800 text-white transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64  " : "w-16  "
        }`}
      >
        <div className="p-4 flex justify-between items-center">
          {isSidebarOpen && (
            <div className="flex items-center">
              <Image
                src="/images/logo.svg"
                alt="TailAdmin Logo"
                width={32}
                height={32}
                className="mr-2"
              />
              <h1 className="text-2xl font-bold">Admin</h1>
            </div>
          )}
         
        </div>
        <nav className="mt-8">
          {menuGroups?.map((group) => (
            <div key={group.name} className="mb-4">
              {isSidebarOpen && (
                <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.name}
                </h2>
              )}
              {group.menuItems.map((item) => (
                <MenuItem
                  key={item.route}
                  item={item}
                  isActive={pathname === item.route}
                  onClick={() => {}}
                  icon={group.icon}
                  isSidebarOpen={isSidebarOpen}
                />
              ))}
            </div>
          ))}
        </nav>
      </aside> */}

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <h2 className="text-xl font-semibold">Welcome, Admin</h2>
          <div className="flex items-center">
            <button className="p-1 mr-4 rounded-full hover:bg-gray-100">
              <Settings className="w-6 h-6" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center">
                  <img
                    className="w-8 h-8 rounded-full mr-2"
                    src="/images/logo.svg"
                    alt="User avatar"
                  />
                  <span className="text-sm font-medium">John Doe</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>My Contacts</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
