"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Mail, MailCheck, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        toast({
          title: "Revisa tu correo",
          description: "Si el email existe, recibirás un enlace para restablecer tu contraseña.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo enviar el email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Misma cara que /reset-password: tarjeta redondeada, borde suave,
            etiqueta sobre el campo y los enlaces de vuelta como botón. */}
        <Card className="rounded-3xl border-purple-100/70 shadow-[0_12px_40px_rgba(24,10,48,0.12)] dark:border-white/10">
          <CardHeader className="pb-2 text-center">
            <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-purple-100 dark:bg-white/10">
              <Mail className="h-6 w-6 text-purple-700 dark:text-purple-300" />
            </span>
            <CardTitle className="font-display text-2xl font-bold text-purple-900 dark:text-purple-100">
              ¿Olvidaste tu contraseña?
            </CardTitle>
            <p className="mt-1 text-sm text-gray-600 dark:text-purple-100/70">
              Déjanos tu correo y te mandamos un enlace para crear una nueva.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {sent ? (
              <div className="flex flex-col items-center rounded-2xl bg-purple-50 px-6 py-10 text-center dark:bg-white/5">
                <MailCheck className="mb-3 h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                <p className="mb-6 text-sm text-purple-900 dark:text-purple-100">
                  Si ese correo tiene cuenta, ya salió el enlace para restablecer
                  la contraseña. Revisa también la carpeta de spam.
                </p>
                <Button className="w-full rounded-full" asChild>
                  <Link href="/login">Volver a iniciar sesión</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-purple-100/80">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 rounded-xl pl-10"
                    />
                  </div>
                </div>
                <Button type="submit" className="h-12 w-full rounded-full text-base" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar enlace"}
                </Button>
                <Button type="button" variant="ghost" className="w-full rounded-full" asChild>
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver a iniciar sesión
                  </Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 