// app/error.tsx
"use client";
export default function Error({ reset }: { reset: () => void }) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
            <h2 className="text-xl mb-4">Có lỗi xảy ra khi tải dữ liệu!</h2>
            <button onClick={() => reset()} className="px-4 py-2 border border-white rounded">
                Thử lại
            </button>
        </div>
    );
}