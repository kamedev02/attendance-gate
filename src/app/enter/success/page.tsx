export default function EnterSuccessPage() {
	return (
		<main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
			<div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md text-center">
				<h1 className="text-2xl font-bold text-blue-700">
					Yêu cầu điểm danh đã được ghi nhận
				</h1>

				<p className="text-gray-700 mt-4">
					Hệ thống đã ghi nhận điểm danh của bạn 🎉
					<br />
					Chúc bạn một buổi học hiệu quả nhé!
				</p>

				{/* <p className="text-xs text-gray-400 mt-6">
					Lưu ý: Điểm danh chỉ hoàn tất khi giảng viên xác nhận.
				</p> */}
			</div>
		</main>
	);
}
