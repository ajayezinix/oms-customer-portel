export default function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-12 animate-pulse rounded-lg bg-[#1e1e2e]" />
      ))}
    </div>
  );
}
