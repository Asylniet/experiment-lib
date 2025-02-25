import React from "react";
import { Variant } from "@/types";
import { useExparoVariantsContext } from "@/react/exparo-variants";

type ExparoVariantRendererProps<T> = {
  children: React.ReactNode | ((payload: T | undefined) => React.ReactNode);
  variantKey: Variant["key"];
};

export function ExparoVariantRenderer<T>(props: ExparoVariantRendererProps<T>) {
  const experiment = useExparoVariantsContext<T>();
  const variant = experiment.variant;

  if (!variant) {
    return "NOV";
  }

  if (variant.key !== props.variantKey) {
    return null;
  }

  if (typeof props.children === "function") {
    return props.children(variant.payload);
  }

  return props.children;
}
