import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import Dashboard from "./components/dashboard-manage";
import {
  fetchDashBoardBoatsNavItem,
  fetchDashBoardSectionsAndNavItems,
} from "@/services/dashboard-services";

const Page = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["sectionsAndNavItems"],
    queryFn: fetchDashBoardSectionsAndNavItems,
  });
  console.log("lets learn");

  await queryClient.prefetchQuery({
    queryKey: ["boatsNavItem"],
    queryFn: fetchDashBoardBoatsNavItem,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Dashboard />
    </HydrationBoundary>
  );
};

export default Page;
