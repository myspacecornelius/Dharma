import { useEffect, useState } from "react";

type Entry = { user_id: string; score: number; rank: number };

export default function Leaderboard() {
  const [rows, setRows] = useState<Entry[]>([]);

  useEffect(() => {
    fetch("/api/community/leaderboard", { credentials: "include" })
      .then(r => r.json()).then(setRows).catch(() => {});
  }, []);

  return (
    <div className="p-4 rounded-2xl shadow bg-white">
      <h2 className="text-lg font-semibold mb-3">LACES Leaderboard</h2>
      <ol className="space-y-1">
        {rows.map(r => (
          <li key={r.user_id} className="flex justify-between">
            <span>#{r.rank} — {r.user_id}</span>
            <span className="font-mono">{r.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}