import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, ShoppingCart, BarChart } from "lucide-react";

export default function SimpleAdminDashboard() {
  const dashboardItems = [
    { title: "Total Users", value: "1,234", icon: Users },
    { title: "Revenue", value: "$10,234", icon: DollarSign },
    { title: "Orders", value: "356", icon: ShoppingCart },
    { title: "Conversion Rate", value: "3.2%", icon: BarChart },
  ];

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

      <p className="text-xl mb-8 max-w-3xl">
        Welcome to your streamlined admin interface. This dashboard provides a
        quick overview of key metrics, allowing you to monitor your business
        performance at a glance. The minimalist black and white design ensures
        clarity and focus on the essential data.
      </p>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardItems.map((item, index) => (
          <Card key={index} className="border-2 border-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div> */}
    </div>
  );
}
