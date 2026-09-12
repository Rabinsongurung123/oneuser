import { redirect } from "next/navigation";

export default function AdminIndex() {
  return redirect("/admin/dashboard");
}
