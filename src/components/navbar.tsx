"use client";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import React from "react";
import { useAccount } from "wagmi";
import {
	Avatar,
	Identity,
	Name,
	Badge,
	Address,
} from "@coinbase/onchainkit/identity";

export default function Navbar() {
	const { address } = useAccount();
	console.log(address);
	return (
		<div className="w-full py-4 border-b border-t-slate-100 bg-[#F9FAFB]">
			<div className="w-11/12 mx-auto max-w-screen-2xl flex items-center justify-between">
				<h5 className="text-lg tracking-wider">POCP</h5>
				{!address ? (
					<ConnectWallet />
				) : (
					<Identity
						address={address}
						schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
					>
						<Avatar />
						<Name>
							<Badge />
						</Name>
						<Address />
					</Identity>
				)}
			</div>
		</div>
	);
}
