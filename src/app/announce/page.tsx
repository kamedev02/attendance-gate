"use client";

import { useEffect, useState, useRef } from "react";

type Announcement = {
	success: boolean;
	message: string;
	studentId: string;
	studentName: string;
	checkedInAt: string;
};

export default function AnnouncePage() {
	const [items, setItems] = useState<Announcement[]>([]);
	const bottomRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const es = new EventSource("/api/announce/stream");

		es.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data) as Announcement;
				setItems((prev) => {
					const next = [...prev, data];
					// giữ max 200 dòng cho nhẹ
					if (next.length > 200) next.splice(0, next.length - 200);
					return next;
				});
			} catch (e) {
				console.error("Event parse error:", e);
			}
		};

		es.onerror = (err) => {
			console.error("SSE error:", err);
			// có thể auto reconnect bằng cách đóng + reload trang nếu muốn
		};

		return () => {
			es.close();
		};
	}, []);

	useEffect(() => {
		// auto scroll xuống cuối mỗi khi có log mới
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [items]);

	function pastelColorFromId(id: string) {
		let hash = 0;
		for (let i = 0; i < id.length; i++) {
			hash = id.charCodeAt(i) + ((hash << 5) - hash);
		}

		const hue = Math.abs(hash) % 360;

		return `hsl(${hue}, 70%, 90%)`;
	}

	return (
		<main className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
			<div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6 flex flex-col">
				{/* <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">
					Thông báo sinh viên vào lớp
				</h1> */}

				<div className="flex-1 border border-gray-200 rounded-lg overflow-y-auto max-h-[70vh] bg-gray-50 p-3 space-y-2">
					{items.length === 0 && (
						<div className="text-center text-gray-500 text-sm py-4">
							Chưa có sinh viên nào điểm danh...
						</div>
					)}

					{items.map((item, index) => {
						const time = new Date(
							item.checkedInAt
						).toLocaleTimeString("vi-VN");
						const bg = pastelColorFromId(item.studentId); // pastel theo MSSV

						return (
							<div
								key={index}
								className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex flex-col"
								style={{
									backgroundColor: bg,
									transition: "background-color 0.3s ease",
								}}
							>
								<div className="flex justify-between">
									<span className="font-semibold text-blue-800">
										{item.studentName}
									</span>
									<span className="text-xs text-gray-600">
										{time}
									</span>
								</div>

								<div className="text-xs text-gray-700">
									MSSV:{" "}
									<span className="font-mono font-semibold">
										{item.studentId}
									</span>
								</div>

								<div className="text-xs text-green-700 mt-1">
									{item.message}
								</div>
							</div>
						);
					})}
					<div ref={bottomRef} />
				</div>
			</div>
		</main>
	);
}
