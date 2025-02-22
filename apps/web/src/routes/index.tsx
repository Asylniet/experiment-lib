import { createFileRoute } from "@tanstack/react-router";
import { useGetVariant } from "@repo/exparo";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, error } = useGetVariant("first_experiment");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  return data?.key;
}
