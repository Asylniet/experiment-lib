import { createFileRoute } from "@tanstack/react-router";
import { ExparoVariantRenderer, ExparoVariants } from "@repo/exparo";

export const Route = createFileRoute("/variants")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ExparoVariants experimentKey="second_experiment" fallback="OH NOOO">
      <ExparoVariantRenderer variantKey="variant_1">
        1 asdasdasdas
      </ExparoVariantRenderer>
      <ExparoVariantRenderer variantKey="variant_2">2</ExparoVariantRenderer>
    </ExparoVariants>
  );
}
