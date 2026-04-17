import { readData } from "@/lib/store";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const data = await readData();
  return <AdminClient initial={data} />;
}
