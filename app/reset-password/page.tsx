'use client'
export const dynamic = 'force-dynamic';
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Eye, EyeOff, Lock, CheckCircle2, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        toast({
          title: "Contraseña restablecida",
          description: "Ahora puedes iniciar sesión con tu nueva contraseña.",
        });
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo restablecer la contraseña.",
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

  /** Campo de contraseña con el ojito para verla. */
  const CampoClave = ({
    id, valor, alCambiar, etiqueta, visible, alternar,
  }: {
    id: string; valor: string; alCambiar: (v: string) => void;
    etiqueta: string; visible: boolean; alternar: () => void;
  }) => (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700 dark:text-purple-100/80">
        {etiqueta}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder="Mínimo 6 caracteres"
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          required
          disabled={loading}
          className="h-12 rounded-xl pl-10 pr-12"
        />
        <button
          type="button"
          onClick={alternar}
          disabled={loading}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-gray-500 transition-colors hover:text-purple-700 dark:text-purple-100/60 dark:hover:text-purple-200"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/*
          Antes era una tarjeta con dos <Input type="password"> pelados, sin
          etiquetas, sin forma de ver lo que se escribe y con los enlaces de
          vuelta como texto subrayado. Escribir una contraseña a ciegas y
          después confirmarla también a ciegas es justo donde la gente se
          equivoca y abandona.
        */}
        <Card className="rounded-3xl border-purple-100/70 shadow-[0_12px_40px_rgba(24,10,48,0.12)] dark:border-white/10">
          <CardHeader className="pb-2 text-center">
            <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-purple-100 dark:bg-white/10">
              <Lock className="h-6 w-6 text-purple-700 dark:text-purple-300" />
            </span>
            <CardTitle className="font-display text-2xl font-bold text-purple-900 dark:text-purple-100">
              Restablecer contraseña
            </CardTitle>
            <p className="mt-1 text-sm text-gray-600 dark:text-purple-100/70">
              Elige una contraseña nueva para tu cuenta.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {success ? (
              <div className="flex flex-col items-center rounded-2xl bg-purple-50 px-6 py-10 text-center dark:bg-white/5">
                <CheckCircle2 className="mb-3 h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                <p className="mb-6 font-medium text-purple-900 dark:text-purple-100">
                  Contraseña restablecida. Te llevamos al inicio de sesión…
                </p>
                <Button className="w-full rounded-full" asChild>
                  <Link href="/login">Ir a iniciar sesión</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <CampoClave
                  id="password" etiqueta="Nueva contraseña" valor={password}
                  alCambiar={setPassword} visible={verPassword}
                  alternar={() => setVerPassword((v) => !v)}
                />
                <CampoClave
                  id="confirm" etiqueta="Confirmar contraseña" valor={confirm}
                  alCambiar={setConfirm} visible={verConfirm}
                  alternar={() => setVerConfirm((v) => !v)}
                />
                <Button type="submit" className="h-12 w-full rounded-full text-base" disabled={loading}>
                  {loading ? "Restableciendo..." : "Restablecer contraseña"}
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

/**
 * `useSearchParams()` obliga a que el componente esté dentro de un límite de
 * Suspense: sin él, `next build` falla al prerenderizar esta página
 * ("useSearchParams() should be wrapped in a suspense boundary") y se cae todo
 * el despliegue. `force-dynamic` por sí solo no alcanza en Next 16.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <p className="text-sm text-gray-500">Cargando…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
