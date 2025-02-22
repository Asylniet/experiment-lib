import React from "react";

type QueryState<T> = {
  data?: T;
  error?: Error;
  isLoading: boolean;
};

export const useQuery = <T>(fetcher: () => Promise<T>, deps: any[] = []) => {
  const [state, setState] = React.useState<QueryState<T>>({ isLoading: true });

  const stableFetcher = React.useRef(fetcher);
  stableFetcher.current = fetcher;

  React.useEffect(() => {
    let ignore = false;
    setState({ isLoading: true });

    stableFetcher
      .current()
      .then((data) => {
        if (!ignore) {
          setState({ data, isLoading: false });
        }
      })
      .catch((error) => {
        if (!ignore) {
          setState({ error, isLoading: false });
        }
      });

    return () => {
      ignore = true;
    };
  }, deps);

  return state;
};
