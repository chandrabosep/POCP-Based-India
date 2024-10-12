"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Shield, Globe, LinkIcon, ToyBrick } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
	return (
		<>
			<main className="md:px-4 py-20">
				<section className="text-center mb-20">
					<div className="text-3xl md:text-7xl font-bold mt-10 my-9 md:my-6 text-white relative">
						Proof of Connection Protocol
						<Image
							src="/builtonbase.svg"
							alt="POCP Logo"
							className="absolute right-8 md:right-10 top-14 w-20 md:w-40 rotate-12 md:-rotate-12"
							width={300}
							height={300}
						/>
					</div>
					<p className="text-lg md:text-2xl mb-8 text-gray-200">
						Connecting Experiences, Building Futures
					</p>
					<Link
						href="/add-event"
						className="bg-[#0152FF] hover:bg-[#0152FF] text-white text-sm md:text-lg font-medium px-8 py-3 md:py-4 rounded-full w-fit"
					>
						Add Event
					</Link>
				</section>

				<section className="mb-20">
					<Card className="bg-gray-500 bg-opacity-50 backdrop-contrast-100 backdrop-filter  backdrop-blur border border-white/20">
						<CardHeader>
							<CardTitle className="text-2xl text-white font-semibold">{`What is Proof of Connection (POCP)?`}</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-y-4 list-outside">
							{[
								"POCP is a decentralized protocol that operates on the BASE chain.",
								"POCP brings meaningful interactions, such as connections made at events, on-chain.",
								"POCP is designed for everyone, including students, developers, and event participants.",
								"POCP leverages blockchain technology to create lasting, immutable records of interactions.",
								"POCP boosts networking by offering verifiable, lasting records of interactions, fostering stronger collaboration and community growth.",
							].map((item, index) => (
								<li
									className="text-gray-300 list-outside list-disc list-item"
									key={index}
								>
									{item}
								</li>
							))}
						</CardContent>
					</Card>
				</section>

				<section
					id="features"
					className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10"
				>
					<FeatureCard
						icon={<ToyBrick className="w-8 h-8 text-purple-400" />}
						title="Integration with Luma"
						description="Easily integrate Luma events into POCP to enable proof of your interactions of your event."
					/>
					<FeatureCard
						icon={<Globe className="w-8 h-8 text-[#2d64db]" />}
						title="Powered by BASE"
						description="POCP ensures high performance and low transaction costs for storing connections on-chain."
					/>
					<FeatureCard
						icon={<Shield className="w-8 h-8 text-red-400" />}
						title="Secure Attestations"
						description="Utilize Ethereum Attestation Service for verifiable connection proofs on BASE."
					/>

					<FeatureCard
						icon={<Sparkles className="w-8 h-8 text-blue-400" />}
						title="Universal Inclusion"
						description="Onboard everyone to on-chain via BASE, regardless of their experience level."
					/>
					<FeatureCard
						icon={<LinkIcon className="w-8 h-8 text-green-400" />}
						title="Seamless Networking"
						description="Generate enduring digital proof of event connections using QR codes."
					/>
					<FeatureCard
						icon={<Zap className="w-8 h-8 text-yellow-400" />}
						title="Future-Ready"
						description="Build upon interactions for future opportunities and collaborations."
					/>
				</section>

				<section className="mt-24">
					<Card className="bg-gray-600 bg-opacity-50 backdrop-contrast-100 backdrop-filter  backdrop-blur border border-white/20 py-4">
						<CardHeader>
							<CardTitle className="text-2xl text-white text-center font-semibold">
								{`Built on BASE ecosystem`}
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-wrap gap-4 items-center justify-center">
							{[
								{ title: "BASE", image: "/base.webp" },
								{
									title: "Onchain Kit",
									image: "/onchainkit.png",
								},
								{
									title: "Smart Wallet",
									image: "/smartwallet.svg",
								},
								{ title: "Paymaster", image: "/paymaster.svg" },
								{ title: "EAS", image: "/eas.png" },
							].map((item, index) => (
								<div
									className="bg-gray-500 bg-opacity-50 backdrop-contrast-100 backdrop-filter  backdrop-blur border border-white/20 flex items-center justify-center rounded-full w-fit py-2 px-4 min-w-32 md:min-w-48 gap-x-2 text-white"
									key={index}
								>
									<Image
										src={item.image}
										alt="alt"
										width={500}
										height={500}
										className="size-6 md:size-8"
									/>
									{item.title}
								</div>
							))}
						</CardContent>
					</Card>
				</section>
			</main>

			<footer className="border-t border-gray-800 mt-10 py-8 text-center text-white flex flex-col md:flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<Image
						src={"/base.webp"}
						alt="alt"
						className="size-6 rounded-full"
						width={50}
						height={50}
					/>
					<p className="text-lg font-medium pt-1">
						Built at BASED INDIA
					</p>
				</div>
				<div className="flex items-center gap-4 text-lg font-medium">
					Built by{" "}
					<Link
						href={"https://chandrabose.xyz"}
						className="border-b border-primaryColor leading-5"
						target="_blank"
					>
						Chandra Bose
					</Link>
					&
					<Link
						href={"https://x.com/muja002"}
						className="border-b border-primaryColor leading-5"
					>
						Mujahid
					</Link>
				</div>
			</footer>
		</>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="bg-gray-500 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm hover:bg-opacity-75 transition-all duration-300 border border-white/20">
			<div className="mb-4">{icon}</div>
			<h3 className="text-xl font-semibold mb-2">{title}</h3>
			<p className="text-gray-400">{description}</p>
		</div>
	);
}
