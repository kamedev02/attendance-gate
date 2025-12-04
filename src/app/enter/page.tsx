import { Suspense } from "react";
import { EnterForm } from "./EnterForm";

export default function EnterPage() {
	return (
		<main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
			<Suspense fallback={<div>Đang tải form điểm danh...</div>}>
				<EnterForm />
			</Suspense>
		</main>
	);
}
