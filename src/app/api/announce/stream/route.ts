/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/announce/stream/route.ts
import { NextResponse } from "next/server";

type Announcement = {
	success: boolean;
	message: string;
	studentId: string;
	studentName: string;
	checkedInAt: string;
};

declare global {
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

export const runtime = "nodejs"; // đảm bảo chạy node runtime
export const dynamic = "force-dynamic";

export async function GET() {
	const { messages, subscribers } = getStore();
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		start(controller) {
			const send = (ann: Announcement) => {
				const chunk = `data: ${JSON.stringify(ann)}\n\n`;
				controller.enqueue(encoder.encode(chunk));
			};

			// Gửi hết history ban đầu cho client
			for (const m of messages) {
				send(m);
			}

			// Đăng ký subscriber
			subscribers.push(send);

			// cleanup khi client ngắt kết nối
			const cleanup = () => {
				const idx = subscribers.indexOf(send);
				if (idx !== -1) subscribers.splice(idx, 1);
			};

			// Không có hook cancel trực tiếp, nhưng khi stream đóng sẽ chạy cancel
			(controller as any)._cleanup = cleanup;
		},
		cancel(reason) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { subscribers } = getStore();
			const toRemove = (reason as any)._cleanup as
				| (() => void)
				| undefined;
			if (toRemove) toRemove();
		},
	});

	return new NextResponse(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
		},
	});
}
