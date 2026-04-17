import { readData } from "@/lib/store";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await readData();
  return <AdminClient initial={data} />;
}
