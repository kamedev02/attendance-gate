/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

type TokenResponse = {
	token: string;
	exp: number;
	ttl: number;
};

export default function Home() {
	const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
	const [remaining, setRemaining] = useState<number | null>(null);

	const fetchToken = async () => {
		const res = await fetch("/api/attendance/token");
		const data = (await res.json()) as TokenResponse;
		setTokenData(data);
		setRemaining(data.exp - Math.floor(Date.now() / 1000));
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchToken();
		const interval = setInterval(fetchToken, 3000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (!tokenData) return;
		const timer = setInterval(() => {
			setRemaining(tokenData.exp - Math.floor(Date.now() / 1000));
		}, 1000);
		return () => clearInterval(timer);
	}, [tokenData]);

	const qrValue = tokenData
		? `${BASE_URL}/enter?token=${encodeURIComponent(tokenData.token)}`
		: "";

	return (
		<main className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
			<h1 className="text-3xl font-bold text-blue-700 mb-6">
				Quét QR để điểm danh
			</h1>

			<div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
				{tokenData ? (
					<>
						<QRCodeCanvas value={qrValue} size={350} />
					</>
				) : (
					<p className="text-gray-500">Đang tạo mã QR…</p>
				)}
			</div>
		</main>
	);
}
