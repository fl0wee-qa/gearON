import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/nav";
import { getAuthSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="border-border/70 bg-card/70 rounded-2xl border p-4 lg:sticky lg:top-24 lg:h-fit">
        <AdminNav />
      </aside>
      <div>{children}</div>
    </div>
  );
}
