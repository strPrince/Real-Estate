export default function SkeletonCard({ variant = 'card' }) {
  if (variant === 'list') {
    return (
      <div className="px-6 py-5 animate-pulse">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-48" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 bg-gray-100 rounded-full w-16" />
            <div className="h-3 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-md bg-white animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="flex gap-3 pt-2 border-t">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-12" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}
