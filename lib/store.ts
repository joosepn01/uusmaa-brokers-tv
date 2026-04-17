// Static-export friendly store. The broker list is shipped as a JSON file
// that gets bundled into the build output — no runtime fs access, no API
// routes needed. To update rankings, edit data/brokers.json and push to git;
// Cloudflare Pages rebuilds automatically.
import seedData from "../data/brokers.json";

export type Broker = {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  image: string;
};

export type Data = {
  brokers: Broker[];
  monthlyTop: string[];
  yearlyTop: string[];
  lastSyncedAt?: string;
};

export async function readData(): Promise<Data> {
  return seedData as Data;
}

export function previousMonthLabel(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function currentYearLabel(now = new Date()): string {
  return String(now.getFullYear());
}
