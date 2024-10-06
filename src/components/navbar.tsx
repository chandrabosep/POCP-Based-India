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

export default function Navbar() {
	const { address } = useAccount();
	console.log(address);
	return (
		<div className="w-full py-4 border-b border-t-slate-100 bg-[#F9FAFB]">
			<div className="w-11/12 mx-auto max-w-screen-xl flex items-center justify-between">
				<h5 className="text-lg tracking-wider">POCP</h5>
				<div className="flex justify-end">
					<Wallet>
						<ConnectWallet>
							<Avatar className="h-6 w-6" />
							<Name />
						</ConnectWallet>
						<WalletDropdown>
							<Identity
								className="px-4 pt-3 pb-2"
								hasCopyAddressOnClick
							>
								<Avatar />
								<Name />
								<Address className={``} />
								<EthBalance />
							</Identity>
							<WalletDropdownDisconnect text="Log out" />
						</WalletDropdown>
					</Wallet>
				</div>
			</div>
		</div>
	);
}
