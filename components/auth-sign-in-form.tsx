"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm({
  googleEnabled,
  callbackUrl,
}: {
  googleEnabled: boolean;
  callbackUrl: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("user@gearon.dev");
  const [password, setPassword] = useState("User123!");
  const [isPending, startTransition] = useTransition();

  const handleCredentials = () => {
    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result || result.error) {
        toast.error("Invalid credentials.");
        return;
      }

      toast.success("Signed in.");
      router.push(result.url ?? callbackUrl);
      router.refresh();
    });
  };

  return (
    <Card className="border-border/70 bg-card/70 mx-auto w-full max-w-md rounded-2xl">
      <CardHeader>
        <CardTitle className="font-display text-2xl font-black uppercase italic">
          Sign In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button
          className="w-full rounded-xl"
          onClick={handleCredentials}
          disabled={isPending}
        >
          Continue with Credentials
        </Button>

        {googleEnabled ? (
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => signIn("google", { callbackUrl })}
          >
            Continue with Google
          </Button>
        ) : null}

        <div className="border-border bg-muted/40 text-muted-foreground rounded-xl border p-3 text-xs">
          Demo admin: <strong>admin@gearon.dev</strong> /{" "}
          <strong>Admin123!</strong>
          <br />
          Demo user: <strong>user@gearon.dev</strong> /{" "}
          <strong>User123!</strong>
        </div>
      </CardContent>
    </Card>
  );
}
