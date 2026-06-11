// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
            <h1 className="text-6xl font-black mb-4">404</h1>
            <p className="text-slate-400 mb-8">Trang này không tồn tại hoặc đã bị xóa.</p>
            <Link href="/" className="px-6 py-2 bg-blue-500 rounded-full font-bold">
                Quay về trang chủ
            </Link>
        </div>
    );
}