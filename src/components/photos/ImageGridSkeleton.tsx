export function ImageGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          className="relative animate-pulse overflow-hidden rounded-lg bg-gray-100"
          key={index}
        >
          <div className="relative aspect-[3/2] w-full">
            <div className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      ))}
    </div>
  )
}
