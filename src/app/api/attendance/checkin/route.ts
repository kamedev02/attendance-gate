import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const N8N_URL = process.env.N8N_ATTEND_WEBHOOK_URL!;
const N8N_SECRET = process.env.N8N_ATTEND_SECRET || "";

type JwtPayload = {
	jti: string;
	iat: number;
	exp: number;
};

export async function POST(req: NextRequest) {
	const { token, studentId } = await req.json().catch(() => ({}));

	if (!token || !studentId) {
		return NextResponse.json(
			{ success: false, message: "Thiếu token hoặc mã số sinh viên." },
			{ status: 400 }
		);
	}

	// Verify token
	let decoded: JwtPayload;
	try {
		decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (err) {
		return NextResponse.json(
			{ success: false, message: "Mã QR đã hết hạn hoặc không hợp lệ." },
			{ status: 401 }
		);
	}

	// Expired check
	const now = Math.floor(Date.now() / 1000);
	if (decoded.exp < now) {
		return NextResponse.json(
			{ success: false, message: "Mã QR đã hết hạn. Vui lòng quét lại." },
			{ status: 401 }
		);
	}

	// Metadata log
	const userAgent = req.headers.get("user-agent") || "";
	const ip =
		req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		req.headers.get("x-real-ip") ||
		"unknown";

	const payload = {
		action: "checkin",
		studentId,
		tokenId: decoded.jti,
		scannedAt: new Date().toISOString(),
		ip,
		userAgent,
	};

	// Send to n8n
	try {
		const res = await fetch(N8N_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(N8N_SECRET ? { "x-api-key": N8N_SECRET } : {}),
			},
			body: JSON.stringify(payload),
		});

		const data = await res.json().catch(() => null);

		return NextResponse.json(
			data ?? { success: true, message: "Điểm danh thành công!" }
		);
	} catch (err) {
		console.error(err);
		return NextResponse.json(
			{ success: false, message: "Không thể ghi log vào n8n." },
			{ status: 500 }
		);
	}
}
