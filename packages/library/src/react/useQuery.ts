import React from "react";

type QueryState<T> = {
	data?: T;
	error?: unknown;
	isLoading: boolean;
}

export const useQuery = <T>(fetcher: () => Promise<T>) => {
	const [state, setState] = React.useState<QueryState<T>>({ isLoading: true });
	
	React.useEffect(() => {
		let ignore = false;
		setState({ isLoading: true });
		
		fetcher()
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
	}, [fetcher]);
	
	return state;
};