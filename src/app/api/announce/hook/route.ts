import { NextRequest, NextResponse } from "next/server";

type Announcement = {
	success: boolean;
	message: string;
	studentId: string;
	studentName: string;
	checkedInAt: string;
};

declare global {
	// Lưu danh sách thông báo trong bộ nhớ
	// và danh sách subscriber SSE
	// (chỉ dùng demo / môi trường chạy lâu dài, không phải serverless strict)
	var __announceMessages: Announcement[] | undefined;
	var __announceSubscribers: ((data: Announcement) => void)[] | undefined;
}

function getStore() {
	if (!globalThis.__announceMessages) {
		globalThis.__announceMessages = [];
	}
	if (!globalThis.__announceSubscribers) {
		globalThis.__announceSubscribers = [];
	}
	return {
		messages: globalThis.__announceMessages,
		subscribers: globalThis.__announceSubscribers,
	};
}

export async function POST(req: NextRequest) {
	const body = await req.json().catch(() => null);

	if (!body) {
		return NextResponse.json(
			{ success: false, message: "Invalid JSON body" },
			{ status: 400 }
		);
	}

	const ann: Announcement = {
		success: body.success ?? false,
		message: body.message ?? "Điểm danh thành công. Mời bạn vào lớp!",
		studentId: body.studentId ?? "UNKNOWN",
		studentName: body.studentName ?? "Sinh viên",
		checkedInAt: body.checkedInAt ?? new Date().toISOString(),
	};

	const { messages, subscribers } = getStore();

	// Append vào danh sách (giữ tối đa 200 entries cho nhẹ)
	messages.push(ann);
	if (messages.length > 200) {
		messages.splice(0, messages.length - 200);
	}

	for (const fn of subscribers) {
		try {
			fn(ann);
		} catch (e) {
			console.error("SSE subscriber error:", e);
		}
	}

	return NextResponse.json({ success: true });
}
