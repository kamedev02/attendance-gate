"use client";

import { FormEvent, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function EnterForm() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get("token");

	const [studentId, setStudentId] = useState("");
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState<string | null>(null);

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setErr(null);

		if (!token) {
			setErr("Liên kết không hợp lệ, vui lòng quét QR lại.");
			return;
		}

		if (!studentId.trim()) {
			setErr("Vui lòng nhập mã số sinh viên.");
			return;
		}

		setLoading(true);

		try {
			const res = await fetch("/api/attendance/checkin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, studentId: studentId.trim() }),
			});

			const data = await res.json();

			if (res.ok && data.success) {
				// Trang success “chung chung”, không show MSSV để tránh điểm danh hộ
				router.replace("/enter/success");
			} else {
				setErr(data.message || "Không thể gửi yêu cầu điểm danh.");
			}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			setErr("Lỗi kết nối server, vui lòng thử lại.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-4">
			<h1 className="text-2xl font-bold text-center text-blue-700">
				Điểm danh vào lớp
			</h1>

			<form onSubmit={onSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-1">
						Mã số sinh viên
					</label>
					<input
						value={studentId}
						onChange={(e) => setStudentId(e.target.value)}
						className="w-full border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200"
						placeholder="VD: 20123456"
					/>
				</div>

				{err && (
					<div className="bg-red-100 border border-red-300 text-red-700 p-2 text-xs rounded">
						{err}
					</div>
				)}

				<button
					type="submit"
					disabled={loading}
					className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
				>
					{loading ? "Đang gửi…" : "Gửi điểm danh"}
				</button>
			</form>
		</div>
	);
}
