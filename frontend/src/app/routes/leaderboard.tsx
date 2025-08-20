import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <div className="mt-4">
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
