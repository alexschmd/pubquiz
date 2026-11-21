import { createFileRoute } from "@tanstack/react-router";
import { ManageView } from "../components/ManageView";
import { ManageSkeleton } from "../components/LoadingSkeletons";
export const Route = createFileRoute("/regie")({
  ssr: false,
  component: ManageView,
  pendingComponent: ManageSkeleton,
  head: () => ({
    meta: [
      { title: "Pubquiz | Regie" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
