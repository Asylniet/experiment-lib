import React from "react";
import { Experiment } from "@/types";
import { UseGetVariantReturnType } from "@/types/react";
import { useGetVariant } from "@/react/useGetVariant";

type ExparoVariantsContextType<T> = UseGetVariantReturnType<T>;

const ExparoVariantsContext = React.createContext<
  ExparoVariantsContextType<any> | undefined
>(undefined);

type ExparoVariantsProps = React.PropsWithChildren<{
  experimentKey: Experiment["key"];
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}>;

function ExparoVariants<T>({
  experimentKey,
  fallback = <div>Something went wrong</div>,
  loading = null,
  children,
}: ExparoVariantsProps) {
  const value = useGetVariant<T>(experimentKey);
  const memoizedValue = React.useMemo(() => value, [value]);

  return (
    <ExparoVariantsContext.Provider value={memoizedValue}>
      <ExparoVariantInner
        value={memoizedValue}
        fallback={fallback}
        loading={loading}
      >
        {children}
      </ExparoVariantInner>
    </ExparoVariantsContext.Provider>
  );
}

type ExparoVariantInnerProps<T> = Omit<ExparoVariantsProps, "experimentKey"> & {
  value: UseGetVariantReturnType<T>;
};

function ExparoVariantInner<T>({
  value,
  fallback,
  loading,
  children,
}: ExparoVariantInnerProps<T>) {
  if (!value || !value.isRunning) {
    return fallback;
  }

  if (value.isLoading && loading) {
    return loading;
  }

  return children;
}

function useExparoVariantsContext<T>() {
  const context = React.useContext(
    ExparoVariantsContext as React.Context<
      ExparoVariantsContextType<T> | undefined
    >,
  );
  if (!context) {
    throw new Error(
      "useExparoVariantsContext must be used within a ExparoVariantsProvider",
    );
  }
  return context;
}

export { ExparoVariants, useExparoVariantsContext };
