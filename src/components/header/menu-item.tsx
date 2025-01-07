import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface MenuItemProps {
  item: {
    name: string;
    icon: React.ElementType;
    menuItems: Array<{ label: string; route: string }>;
  };
  isActive: boolean;
  icon: React.ElementType;
  onClick?: () => void;
}

export function MenuItem({
  item,
  isActive,
  icon: Icon,
  onClick,
}: MenuItemProps) {
  const [isOpen, setIsOpen] = React.useState(isActive);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenu>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <Icon className="mr-2 h-4 w-4" />
              <span>{item?.name}</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </SidebarMenuItem>
        <CollapsibleContent>
          {item?.menuItems?.map((subItem) => {
            console.log("subitem", subItem);
            return (
              <SidebarMenuItem key={subItem?.route}>
                <SidebarMenuButton asChild className="pl-10">
                  <Link href={subItem.route ?? "#"}>{subItem?.label}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </CollapsibleContent>
      </SidebarMenu>
    </Collapsible>
  );
}
