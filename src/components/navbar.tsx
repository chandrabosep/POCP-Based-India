"use client";
import React from "react";
import { useAccount } from "wagmi";
import {
	Address,
	Avatar,
	Name,
	Identity,
	EthBalance,
} from "@coinbase/onchainkit/identity";
import { color } from "@coinbase/onchainkit/theme";
import {
	ConnectWallet,
	Wallet,
	WalletDropdown,
	WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import Link from "next/link";

export default function Navbar() {
	const { address } = useAccount();
	console.log(address);
	return (
		<div className="w-full">
			<div className="w-11/12 mx-auto max-w-screen-xl flex items-center justify-between py-4 border-b">
				<Link href="/" className="text-2xl font-bold">POCP</Link>
				<div className="flex justify-end">
					<Wallet>
						<ConnectWallet  className="bg-[#0152FF] hover:bg-[#0152FF] text-white">
							<Address className={`text-white`} />
						</ConnectWallet>
						<WalletDropdown >
							<Identity
								className="px-4 pt-3 pb-2 bg-[#0152FF] hover:bg-[#0152FF] text-white"
								hasCopyAddressOnClick
							>
								<Address className={`text-white`} />
								<EthBalance />
							</Identity>
							<WalletDropdownDisconnect text="Log out" className="bg-[#0152FF] hover:bg-[#0152FF] text-white" />
						</WalletDropdown>
					</Wallet>
				</div>
			</div>
		</div>
	);
}
