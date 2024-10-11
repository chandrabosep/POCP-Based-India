"use client";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base, baseSepolia } from "wagmi/chains";
import { type ReactNode, useState } from "react";
import { type State, WagmiProvider } from "wagmi";
import { getConfig } from "@/lib/config";

export function Web3Providers(props: {
	children: ReactNode;
	initialState?: State;
}) {
	const [config] = useState(() => getConfig());
	const [queryClient] = useState(() => new QueryClient());

	return (
		<WagmiProvider config={config} initialState={props.initialState}>
			<QueryClientProvider client={queryClient}>
				<OnchainKitProvider
					apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
					chain={baseSepolia}
				>
					{props.children}
				</OnchainKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
