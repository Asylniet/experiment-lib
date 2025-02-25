import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ExperimentClientProvider } from "@repo/exparo";

export const Route = createRootRoute({
  component: () => (
    <ExperimentClientProvider
      apiKey="0b4aa9f1be74a3583643cad1ba72df8a"
      host="http://localhost:8000"
    >
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </ExperimentClientProvider>
  ),
});
