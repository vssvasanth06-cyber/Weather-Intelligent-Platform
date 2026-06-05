export function CardSkeleton() {
    return (
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 animate-pulse">
            <div className="flex justify-between mb-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg" />
                <div className="w-12 h-4 bg-gray-700 rounded" />
            </div>
            <div className="w-20 h-4 bg-gray-700 rounded mb-2" />
            <div className="w-28 h-8 bg-gray-700 rounded" />
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 animate-pulse">
            <div className="w-32 h-4 bg-gray-700 rounded mb-4" />
            <div className="w-full h-40 bg-gray-700 rounded-xl" />
        </div>
    );
}

export function TableSkeleton() {
    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden animate-pulse">
            <div className="px-4 py-3 border-b border-gray-700 flex gap-4">
                <div className="w-24 h-4 bg-gray-700 rounded" />
                <div className="w-16 h-4 bg-gray-700 rounded" />
            </div>
            {[...Array(6)].map((_, i) => (
                <div key={i} className="px-4 py-2 border-b border-gray-800">
                    <div className="w-full h-3 bg-gray-800 rounded" />
                </div>
            ))}
        </div>
    );
}
