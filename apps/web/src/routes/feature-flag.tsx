import { createFileRoute } from "@tanstack/react-router";
import { ExparoFeatureFlag } from "@repo/exparo";

export const Route = createFileRoute("/feature-flag")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ExparoFeatureFlag experimentKey="first_experiment" fallback="no active">
      active
    </ExparoFeatureFlag>
  );
}
