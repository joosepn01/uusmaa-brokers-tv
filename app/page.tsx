import { readData } from "@/lib/store";
import Board from "./components/Board";

// Build-time labels — `Board` re-derives them on the client so the
// heading stays current even on a stale build, without a hydration
// mismatch (because we seed the same value the server rendered).
function previousMonthEt(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.toLocaleString("et-EE", { month: "long", year: "numeric" });
}
function currentYearEt(now = new Date()): string {
  return String(now.getFullYear());
}

export default async function Page() {
  const data = await readData();
  return (
    <Board
      initialData={data}
      initialLabels={{
        month: previousMonthEt(),
        year: currentYearEt(),
      }}
    />
  );
}
