import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth-sign-in-form";
import { getAuthSession } from "@/lib/auth";
import { googleEnabled } from "@/lib/env";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getAuthSession();
  const resolvedSearchParams = await searchParams;

  const callbackUrl = resolvedSearchParams.callbackUrl ?? "/";

  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  return (
    <div className="py-10">
      <SignInForm googleEnabled={googleEnabled} callbackUrl={callbackUrl} />
    </div>
  );
}
