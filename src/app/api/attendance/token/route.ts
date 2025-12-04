import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
	throw new Error("JWT_SECRET is missing!");
}

export async function GET() {
	const now = Math.floor(Date.now() / 1000);

	const ttl = 60 + Math.floor(Math.random() * 31);
	const exp = now + ttl;

	const jti = crypto.randomUUID();

	const payload = {
		jti,
		iat: now,
		exp,
	};

	const token = jwt.sign(payload, JWT_SECRET);

	return NextResponse.json({
		token,
		exp,
		ttl,
	});
}
