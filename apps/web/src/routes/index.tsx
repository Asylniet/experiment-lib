import { createFileRoute } from "@tanstack/react-router";
import { useFeatureFlag } from "@repo/exparo";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isEnabled, isLoading, error, refresh, isRunning } = useFeatureFlag<{
    message: string;
  }>("first_experiment");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!isRunning) {
    return <div>Experiment is not running</div>;
  }

  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      {isEnabled ? "Enabled" : "Disabled"}
    </div>
  );
}
