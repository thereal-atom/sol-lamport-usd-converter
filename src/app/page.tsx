"use client";

import { useState, ChangeEvent, useEffect } from "react";

const SOLANA_PRICE = 240;
const LAMPORTS_PER_SOL = 10 ** 9; // Use const for clarity and efficiency
const SOL_MINT = "So11111111111111111111111111111111111111112";

const copyToClipboard = (value: string) => {
	navigator.clipboard.writeText(value);
};

export default function Home() {
	const [solana, setSolana] = useState(0);
	const [lamports, setLamports] = useState(0);
	const [usd, setUsd] = useState(0);

	const [solanaPrice, setSolanaPrice] = useState(SOLANA_PRICE);

	const handleInputChange = (setValue: (value: number) => void, conversionFactor: number, setRelatedValues: (newValue: number) => void[]) => (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = Number(e.target.value);
		setValue(newValue);
		setRelatedValues(newValue);
	};

	const handleSolanaChange = handleInputChange(setSolana, 1, newSolana => [setLamports(newSolana * LAMPORTS_PER_SOL), setUsd(newSolana * solanaPrice)]);

	const handleLamportsChange = handleInputChange(setLamports, 1 / LAMPORTS_PER_SOL, newLamports => [
		setSolana(newLamports / LAMPORTS_PER_SOL),
		setUsd((newLamports / LAMPORTS_PER_SOL) * solanaPrice), // Corrected USD calculation
	]);

	const handleUsdChange = handleInputChange(setUsd, 1 / solanaPrice, newUsd => [
		setSolana(newUsd / solanaPrice),
		setLamports((newUsd / solanaPrice) * LAMPORTS_PER_SOL), // Corrected Lamports calculation
	]);

	// fetch price from jupiter price api

	useEffect(() => {
		const fetchSolanaPrice = async () => {
			try {
				const response = await fetch(`https://api.jup.ag/price/v2?ids=${SOL_MINT}`);

				if (!response.ok) {
					const errorBody = await response.json(); // Attempt to parse error details
					throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody?.message || response.statusText}`);
				}

				const body = await response.json();
				const data = body.data[SOL_MINT];

				if (!data || !data.price) {
					throw new Error("Invalid data received from API"); // Handle missing data
				}

				setSolanaPrice(data.price);
			} catch (error) {
				console.error("Error fetching Solana price:", error);
				// Consider showing an error message to the user:
				// setError('Failed to fetch price. Please try again later.');
			}
		};

		fetchSolanaPrice(); // Call the function immediately
	}, []); // Add SOL_MINT to the dependency array

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<p className="font-bold">
					1 SOL = ${solanaPrice.toLocaleString("en-GB", { maximumFractionDigits: 4 })} = {LAMPORTS_PER_SOL.toLocaleString()} LP
				</p>
				<p className="font-bold">
					{solana.toLocaleString("en-GB", { maximumFractionDigits: 12 })} SOL = ${usd.toLocaleString("en-GB", { maximumFractionDigits: 4 })} = {lamports.toLocaleString("en-GB", { maximumFractionDigits: 12 })} LP
				</p>
				<InputLabel htmlFor="solana">Solana Amount</InputLabel>
				<InputWithCopy
					value={solana.toString()}
					onChange={handleSolanaChange}
					placeholder="Solana Amount"
					name="solana"
				/>
				<InputLabel htmlFor="lamports">Lamports Amount</InputLabel>
				<InputWithCopy
					value={lamports.toString()}
					onChange={handleLamportsChange}
					placeholder="Lamports Amount"
					name="lamports"
				/>

				<InputLabel htmlFor="usd">USD Amount</InputLabel>
				<InputWithCopy
					value={usd.toString()}
					onChange={handleUsdChange}
					placeholder="USD Amount"
					name="usd"
				/>
			</main>
		</div>
	);
}

const InputLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
	<label
		htmlFor={htmlFor}
		className="text-xl font-bold">
		{children}
	</label>
);

const NumberInput = ({ value, onChange, placeholder, name }: { value: number; onChange: (e: ChangeEvent<HTMLInputElement>) => void; placeholder: string; name: string }) => (
	<input
		type="number"
		value={value}
		onChange={onChange}
		placeholder={placeholder}
		name={name}
		className="w-full rounded-md bg-black border-2 border-white p-4 text-center text-xl font-bold"
	/>
);

const InputWithCopy = ({ value, onChange, placeholder, name }: { value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; placeholder: string; name: string }) => (
	<div className="flex gap-2">
		<input
			type="text"
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			name={name}
			className="w-full rounded-md bg-black border-2 border-white p-4 text-center text-xl font-bold"
		/>
		<button
			className="ml-2"
			onClick={() => copyToClipboard(value)}>
			Copy
		</button>
	</div>
);
