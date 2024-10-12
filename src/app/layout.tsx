import type { Metadata } from "next";
import "./globals.css";
import QueryProviderWrapper from "@/components/provider/query.provider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar";
import { Web3Providers } from "@/components/provider/onchain-kit.provider";
import "@coinbase/onchainkit/styles.css";

export const metadata: Metadata = {
	title: "POCP",
	description: "Proof of Connection Protocol",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`w-full h-full`}>
				<QueryProviderWrapper>
					<Web3Providers>
						<div className="h-full text-white">
							<Navbar />
							<div className="w-11/12 h-full mx-auto max-w-screen-xl ">
								{children}
							</div>
						</div>
						<Toaster />
					</Web3Providers>
				</QueryProviderWrapper>
			</body>
		</html>
	);
}
