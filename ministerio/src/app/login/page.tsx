"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (otpError) {
      setError("No pudimos enviar el codigo. Revisa el email e intenta de nuevo.");
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    setLoading(false);
    if (verifyError) {
      setError("Codigo incorrecto o vencido. Pedi uno nuevo.");
      return;
    }
    router.replace(`/onboarding?next=${encodeURIComponent(next)}`);
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Ministerio de Adolescentes</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Ingresa tu email para recibir un codigo de acceso. No necesitas contrasena."
              : `Te enviamos un codigo a ${email}. Revisa tu correo.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <Alert variant="destructive">{error}</Alert>}

          {step === "email" ? (
            <form onSubmit={requestCode} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  placeholder="voluntario@iglesia.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar codigo de acceso"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">Codigo de 6 digitos</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center text-lg tracking-[0.4em]"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verificando..." : "Ingresar"}
              </Button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-center text-sm text-muted-foreground underline-offset-2 hover:underline"
              >
                Usar otro email
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
