"use client"

/*
  Página de cuenta, reescrita.

  Lo que había era una plantilla con cuatro pestañas de colores distintos
  (morado, verde esmeralda, rojo, gris), y por debajo casi nada funcionaba:

   · Guardar el perfil devolvía 401 SIEMPRE. La ruta pedía la cookie
     `auth-token`, que no tiene nadie porque se entra con NextAuth. Verificado
     contra el sitio en vivo antes de tocar nada.
   · Cambiar la contraseña devolvía 401 SIEMPRE, por lo mismo: la página no
     mandaba la cabecera `Authorization` que la ruta exigía.
   · "Eliminar cuenta" MENTÍA: esperaba dos segundos, decía "Tu cuenta ha sido
     eliminada permanentemente" y cerraba la sesión. La cuenta seguía entera.
   · Para guardar el teléfono había que rellenar calle, ciudad, provincia,
     código postal y país. En Panamá el código postal casi no se usa.
   · Los pedidos salían con "Total: N/A" (el campo es `totalAmount`, no
     `total`), sin nombre de producto y con la imagen de relleno, porque los
     datos que buscaba no venían en la respuesta.
   · Los interruptores de notificaciones por correo y por SMS no guardaban
     nada en ninguna parte: se movían y al recargar volvían a su sitio. El de
     SMS además prometía algo que la tienda no hace.
   · Media docena de fondos `bg-gray-50` / `bg-green-100` sin variante oscura.

  Ahora son tres pestañas, todo en los colores de la marca, y lo que se ve es
  lo que hay.
*/

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { useTheme } from "@/context/theme-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertCircle,
  ArrowRight,
  Box,
  Calendar,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Package,
  Pencil,
  Phone,
  Settings,
  Shield,
  ShoppingBag,
  Sun,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AuthGuard from "@/components/auth-guard"
import ProfileAvatar from "@/components/profile-avatar"
import AddressForm, { Address } from "@/components/address-form"

const DIRECCION_VACIA: Address = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Panamá",
}

/** Etiqueta y color de cada estado de pedido, en los colores de la marca. */
const ESTADOS: Record<string, { texto: string; clase: string }> = {
  pending: {
    texto: "Pendiente de pago",
    clase: "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200",
  },
  paid: {
    texto: "Pagado",
    clase: "bg-purple-100 text-purple-900 dark:bg-purple-400/15 dark:text-purple-100",
  },
  processing: {
    texto: "En preparación",
    clase: "bg-purple-100 text-purple-900 dark:bg-purple-400/15 dark:text-purple-100",
  },
  shipped: {
    texto: "Enviado",
    clase: "bg-sky-100 text-sky-900 dark:bg-sky-400/15 dark:text-sky-100",
  },
  delivered: {
    texto: "Entregado",
    clase: "bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-100",
  },
  cancelled: {
    texto: "Cancelado",
    clase: "bg-rose-100 text-rose-900 dark:bg-rose-400/15 dark:text-rose-100",
  },
}

function dinero(n: number | null | undefined) {
  return typeof n === "number" ? `$${n.toFixed(2)}` : "—"
}

export default function ProfilePage() {
  const { user, isLoading, logout, updateProfile } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { toast } = useToast()

  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [editandoDireccion, setEditandoDireccion] = useState(false)

  const [datos, setDatos] = useState({ name: "", email: "", phone: "" })
  const [direccion, setDireccion] = useState<Address>(DIRECCION_VACIA)

  const [pedidos, setPedidos] = useState<any[]>([])
  const [cargandoPedidos, setCargandoPedidos] = useState(false)

  const [dialogoClave, setDialogoClave] = useState(false)
  const [dialogoBorrar, setDialogoBorrar] = useState(false)
  const [borrando, setBorrando] = useState(false)
  const [claves, setClaves] = useState({ actual: "", nueva: "", repetir: "" })
  const [verClave, setVerClave] = useState({ actual: false, nueva: false })
  const [cambiandoClave, setCambiandoClave] = useState(false)

  useEffect(() => {
    if (!user) return
    setDatos({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    })
    setDireccion({ ...DIRECCION_VACIA, ...(user.address || {}) })
  }, [user])

  useEffect(() => {
    if (!user) return
    setCargandoPedidos(true)
    fetch("/api/orders", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setPedidos(Array.isArray(d) ? d : []))
      .catch(() => setPedidos([]))
      .finally(() => setCargandoPedidos(false))
  }, [user])

  const miembroDesde = useMemo(() => {
    const f = (user as any)?.createdAt
    if (!f) return null
    const d = new Date(f)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString("es-PA", { month: "long", year: "numeric" })
  }, [user])

  const iniciales = (nombre: string) =>
    nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  /* ── Guardar nombre, correo y teléfono ────────────────────────────────── */
  const guardarDatos = async () => {
    if (!datos.name.trim()) {
      toast({ title: "Falta el nombre", variant: "destructive" })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim())) {
      toast({ title: "Ese correo no parece válido", variant: "destructive" })
      return
    }
    if (datos.phone.trim() && !/^\+?[0-9\s\-()]{7,20}$/.test(datos.phone.trim())) {
      toast({
        title: "Revisa el teléfono",
        description: "Solo números, espacios, guiones, paréntesis y, si quieres, el prefijo +.",
        variant: "destructive",
      })
      return
    }

    setGuardando(true)
    const r = await updateProfile({
      name: datos.name.trim(),
      email: datos.email.trim(),
      phone: datos.phone.trim(),
    })
    setGuardando(false)

    if (r?.success) {
      setEditando(false)
      toast({ title: "Listo", description: "Tus datos quedaron guardados." })
    } else {
      toast({
        title: "No se pudo guardar",
        description: r?.error || "Inténtalo de nuevo en un momento.",
        variant: "destructive",
      })
    }
  }

  /* ── Guardar la dirección de envío ────────────────────────────────────── */
  const guardarDireccion = async (nueva: Address) => {
    const r = await updateProfile({ address: nueva })
    if (r?.success) {
      setDireccion(nueva)
      setEditandoDireccion(false)
      toast({ title: "Dirección guardada" })
    } else {
      toast({
        title: "No se pudo guardar la dirección",
        description: r?.error || "Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const cambiarFoto = async (url: string) => {
    const r = await updateProfile({ avatar: url })
    toast(
      r?.success
        ? { title: "Foto actualizada" }
        : {
            title: "No se pudo cambiar la foto",
            description: r?.error || "Inténtalo de nuevo.",
            variant: "destructive",
          },
    )
  }

  /* ── Contraseña ───────────────────────────────────────────────────────── */
  const cambiarClave = async () => {
    if (claves.nueva !== claves.repetir) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" })
      return
    }
    if (claves.nueva.length < 6) {
      toast({ title: "La contraseña necesita al menos 6 caracteres", variant: "destructive" })
      return
    }
    setCambiandoClave(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: claves.actual,
          newPassword: claves.nueva,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setDialogoClave(false)
        setClaves({ actual: "", nueva: "", repetir: "" })
        toast({ title: "Contraseña cambiada" })
      } else {
        toast({
          title: "No se pudo cambiar",
          description: data.error || "Revisa la contraseña actual.",
          variant: "destructive",
        })
      }
    } catch {
      toast({ title: "Error de conexión", variant: "destructive" })
    } finally {
      setCambiandoClave(false)
    }
  }

  /* ── Baja de la cuenta ────────────────────────────────────────────────── */
  const borrarCuenta = async () => {
    setBorrando(true)
    try {
      const res = await fetch("/api/account", { method: "DELETE", credentials: "include" })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast({ title: "Cuenta eliminada", description: "Se borraron tus datos." })
        logout()
      } else {
        toast({
          title: "No se pudo eliminar",
          description: data.error || "Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch {
      toast({ title: "Error de conexión", variant: "destructive" })
    } finally {
      setBorrando(false)
      setDialogoBorrar(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50 dark:bg-white/5">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-purple-700 dark:text-purple-300" />
          <p className="text-gray-600 dark:text-purple-100/70">Cargando tu cuenta…</p>
        </div>
      </div>
    )
  }

  const tieneDireccion = Boolean(direccion.street || direccion.city || direccion.state)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-purple-50 dark:bg-white/5">
        <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-10">
          {/* ── Cabecera de la cuenta ─────────────────────────────────── */}
          <div className="mb-6 rounded-3xl border border-purple-100 bg-card p-5 shadow-sm dark:border-white/10 sm:p-7">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
              <ProfileAvatar
                currentImage={user?.avatar}
                userName={user?.name || "Usuario"}
                onImageChange={cambiarFoto}
                size="lg"
                isEditing
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-bold text-purple-900 dark:text-purple-50 sm:text-3xl">
                  {user?.name || iniciales("U")}
                </h1>
                <p className="mt-1 flex items-center justify-center gap-2 break-all text-sm text-gray-600 dark:text-purple-100/70 sm:justify-start">
                  <Mail className="h-4 w-4 shrink-0" />
                  {user?.email}
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {user?.isAdmin && (
                    <Badge className="border-none bg-purple-100 text-purple-900 dark:bg-purple-400/15 dark:text-purple-100">
                      <Shield className="mr-1 h-3 w-3" /> Administradora
                    </Badge>
                  )}
                  {miembroDesde && (
                    <Badge
                      variant="outline"
                      className="border-purple-200 text-gray-600 dark:border-white/15 dark:text-purple-100/70"
                    >
                      <Calendar className="mr-1 h-3 w-3" /> Desde {miembroDesde}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="border-purple-200 text-gray-600 dark:border-white/15 dark:text-purple-100/70"
                  >
                    <Package className="mr-1 h-3 w-3" />
                    {pedidos.length === 1 ? "1 pedido" : `${pedidos.length} pedidos`}
                  </Badge>
                </div>
              </div>
              {user?.isAdmin && (
                <Button
                  asChild
                  variant="outline"
                  className="shrink-0 rounded-full border-purple-200 dark:border-white/15"
                >
                  <Link href="/admin">
                    <Settings className="mr-2 h-4 w-4" /> Panel
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="perfil" className="w-full">
            <TabsList className="mb-6 grid h-auto w-full grid-cols-3 gap-1 rounded-2xl border border-purple-100 bg-card p-1.5 dark:border-white/10">
              {/* En el teléfono las etiquetas estaban ocultas y quedaban tres
                  iconos sueltos sin decir a dónde llevaban. Con texto chico
                  entran las tres. */}
              {[
                { v: "perfil", icono: UserIcon, texto: "Mis datos" },
                { v: "pedidos", icono: ShoppingBag, texto: "Pedidos" },
                { v: "cuenta", icono: Shield, texto: "Cuenta" },
              ].map(({ v, icono: Icono, texto }) => (
                <TabsTrigger
                  key={v}
                  value={v}
                  className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 sm:gap-2 sm:text-sm dark:data-[state=active]:bg-white/10 dark:data-[state=active]:text-purple-50"
                >
                  <Icono className="h-4 w-4 shrink-0" />
                  <span>{texto}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Mis datos ───────────────────────────────────────────── */}
            <TabsContent value="perfil" className="space-y-5">
              <section className="rounded-3xl border border-purple-100 bg-card p-5 shadow-sm dark:border-white/10 sm:p-7">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-50">
                      Datos personales
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-purple-100/70">
                      Con esto te escribimos cuando tu pedido cambia de estado.
                    </p>
                  </div>
                  {!editando ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full border-purple-200 dark:border-white/15"
                      onClick={() => setEditando(true)}
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                    </Button>
                  ) : (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        className="rounded-full bg-purple-700 hover:bg-purple-800"
                        onClick={guardarDatos}
                        disabled={guardando}
                      >
                        {guardando ? (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-3.5 w-3.5" />
                        )}
                        Guardar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          setEditando(false)
                          setDatos({
                            name: user?.name || "",
                            email: user?.email || "",
                            phone: user?.phone || "",
                          })
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={datos.name}
                      disabled={!editando}
                      onChange={(e) => setDatos({ ...datos, name: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="correo">Correo</Label>
                    <Input
                      id="correo"
                      type="email"
                      value={datos.email}
                      disabled={!editando}
                      onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="tel">
                      Teléfono <span className="text-gray-500 dark:text-purple-100/50">(opcional)</span>
                    </Label>
                    <Input
                      id="tel"
                      value={datos.phone}
                      disabled={!editando}
                      placeholder="6000-0000"
                      onChange={(e) => setDatos({ ...datos, phone: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>
              </section>

              {/* Dirección de envío */}
              <section className="rounded-3xl border border-purple-100 bg-card p-5 shadow-sm dark:border-white/10 sm:p-7">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-purple-900 dark:text-purple-50">
                      <MapPin className="h-4 w-4" /> Dirección de envío
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-purple-100/70">
                      Se usa para calcular el envío en la compra.
                    </p>
                  </div>
                  {!editandoDireccion && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full border-purple-200 dark:border-white/15"
                      onClick={() => setEditandoDireccion(true)}
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      {tieneDireccion ? "Cambiar" : "Agregar"}
                    </Button>
                  )}
                </div>

                {editandoDireccion ? (
                  <>
                    <AddressForm
                      initialAddress={direccion}
                      onSave={guardarDireccion}
                      noFormWrapper
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 rounded-full"
                      onClick={() => setEditandoDireccion(false)}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : tieneDireccion ? (
                  <p className="text-gray-700 dark:text-purple-100/80">
                    {[direccion.street, direccion.city, direccion.state, direccion.country]
                      .filter(Boolean)
                      .join(", ")}
                    {direccion.zipCode ? ` · ${direccion.zipCode}` : ""}
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-gray-600 dark:text-purple-100/70">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Todavía no tienes una dirección guardada.
                  </p>
                )}
              </section>
            </TabsContent>

            {/* ── Mis pedidos ─────────────────────────────────────────── */}
            <TabsContent value="pedidos" className="space-y-5">
              {cargandoPedidos ? (
                <div className="rounded-3xl border border-purple-100 bg-card p-12 text-center dark:border-white/10">
                  <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-purple-700 dark:text-purple-300" />
                  <p className="text-gray-600 dark:text-purple-100/70">Buscando tus pedidos…</p>
                </div>
              ) : pedidos.length === 0 ? (
                <div className="rounded-3xl border border-purple-100 bg-card p-10 text-center dark:border-white/10 sm:p-14">
                  <span className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-purple-100 dark:bg-white/10">
                    <ShoppingBag className="h-9 w-9 text-purple-700 dark:text-purple-300" />
                  </span>
                  <h3 className="mb-2 text-xl font-semibold text-purple-900 dark:text-purple-50">
                    Todavía no hay pedidos
                  </h3>
                  <p className="mx-auto mb-6 max-w-sm text-gray-600 dark:text-purple-100/70">
                    Cuando hagas tu primera compra aparecerá acá, con su estado y lo que
                    llevaste.
                  </p>
                  <Button asChild className="rounded-full bg-purple-700 px-7 hover:bg-purple-800">
                    <Link href="/shop">
                      Ver la tienda <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                pedidos.map((p) => {
                  const estado = ESTADOS[p.status] ?? {
                    texto: p.status,
                    clase: "bg-purple-100 text-purple-900 dark:bg-white/10 dark:text-purple-100",
                  }
                  return (
                    <article
                      key={p.id}
                      className="overflow-hidden rounded-3xl border border-purple-100 bg-card shadow-sm dark:border-white/10"
                    >
                      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 px-5 py-4 dark:border-white/10">
                        <div>
                          <p className="flex items-center gap-2 font-semibold text-purple-900 dark:text-purple-50">
                            <Box className="h-4 w-4" />
                            Pedido {String(p.id).slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-purple-100/70">
                            {p.createdAt
                              ? new Date(p.createdAt).toLocaleDateString("es-PA", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${estado.clase}`}
                          >
                            {estado.texto}
                          </span>
                          <span className="text-lg font-bold text-purple-900 dark:text-purple-50">
                            {dinero(p.totalAmount)}
                          </span>
                        </div>
                      </header>

                      <ul className="divide-y divide-purple-100 dark:divide-white/10">
                        {(p.items ?? []).map((it: any) => {
                          const prod = it.product
                          const foto = prod?.images?.[0] || "/placeholder.jpg"
                          return (
                            <li key={it.id} className="flex items-center gap-4 px-5 py-4">
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-purple-50 dark:bg-white/5">
                                <Image
                                  src={foto}
                                  alt={prod?.name || "Producto"}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                {prod?.id ? (
                                  <Link
                                    href={`/product/${prod.id}`}
                                    className="font-medium text-purple-900 hover:underline dark:text-purple-50"
                                  >
                                    {prod.name}
                                  </Link>
                                ) : (
                                  <span className="font-medium text-purple-900 dark:text-purple-50">
                                    Producto no disponible
                                  </span>
                                )}
                                <p className="text-sm text-gray-600 dark:text-purple-100/70">
                                  {it.quantity} × {dinero(it.price)}
                                </p>
                              </div>
                              <span className="font-semibold text-purple-900 dark:text-purple-50">
                                {dinero(it.price * it.quantity)}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </article>
                  )
                })
              )}
            </TabsContent>

            {/* ── Cuenta ──────────────────────────────────────────────── */}
            <TabsContent value="cuenta" className="space-y-5">
              <section className="rounded-3xl border border-purple-100 bg-card p-5 shadow-sm dark:border-white/10 sm:p-7">
                <h2 className="mb-5 text-lg font-semibold text-purple-900 dark:text-purple-50">
                  Preferencias
                </h2>
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-purple-100 p-4 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-100 dark:bg-white/10">
                      {isDarkMode ? (
                        <Moon className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                      ) : (
                        <Sun className="h-5 w-5 text-purple-700" />
                      )}
                    </span>
                    <div>
                      <h3 className="font-medium text-purple-900 dark:text-purple-50">Modo oscuro</h3>
                      <p className="text-sm text-gray-600 dark:text-purple-100/70">
                        Se recuerda en este navegador.
                      </p>
                    </div>
                  </div>
                  <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                </div>
                {/*
                  Acá había dos interruptores más, "Notificaciones por email" y
                  "Notificaciones SMS". No guardaban nada y la tienda no manda
                  SMS. El correo de los pedidos sale siempre, así que se dice y
                  ya, sin un botón que no apaga nada.
                */}
                <p className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-purple-100/70">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                  Te escribimos a <strong className="font-medium">{user?.email}</strong> cuando
                  confirmamos tu pedido y cuando sale para entrega.
                </p>
              </section>

              <section className="rounded-3xl border border-purple-100 bg-card p-5 shadow-sm dark:border-white/10 sm:p-7">
                <h2 className="mb-5 text-lg font-semibold text-purple-900 dark:text-purple-50">
                  Seguridad
                </h2>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-100 p-4 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-100 dark:bg-white/10">
                        <Lock className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                      </span>
                      <div>
                        <h3 className="font-medium text-purple-900 dark:text-purple-50">
                          Cambiar contraseña
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-purple-100/70">
                          Si entras con Google no hace falta.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-purple-200 dark:border-white/15"
                      onClick={() => setDialogoClave(true)}
                    >
                      Cambiar
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-100 p-4 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-100 dark:bg-white/10">
                        <LogOut className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                      </span>
                      <div>
                        <h3 className="font-medium text-purple-900 dark:text-purple-50">
                          Cerrar sesión
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-purple-100/70">
                          En este dispositivo.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-purple-200 dark:border-white/15"
                      onClick={logout}
                    >
                      Salir
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 p-4 dark:border-rose-400/20">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 dark:bg-rose-400/15">
                        <Trash2 className="h-5 w-5 text-rose-700 dark:text-rose-300" />
                      </span>
                      <div>
                        <h3 className="font-medium text-purple-900 dark:text-purple-50">
                          Eliminar cuenta
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-purple-100/70">
                          Se borran tus datos. No se puede deshacer.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setDialogoBorrar(true)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Diálogo: contraseña ───────────────────────────────────────── */}
      <Dialog open={dialogoClave} onOpenChange={setDialogoClave}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              Escribe la que usas ahora y la nueva.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-actual">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="c-actual"
                  type={verClave.actual ? "text" : "password"}
                  value={claves.actual}
                  onChange={(e) => setClaves({ ...claves, actual: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={verClave.actual ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-purple-100/60"
                  onClick={() => setVerClave({ ...verClave, actual: !verClave.actual })}
                >
                  {verClave.actual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-nueva">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="c-nueva"
                  type={verClave.nueva ? "text" : "password"}
                  value={claves.nueva}
                  onChange={(e) => setClaves({ ...claves, nueva: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={verClave.nueva ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-purple-100/60"
                  onClick={() => setVerClave({ ...verClave, nueva: !verClave.nueva })}
                >
                  {verClave.nueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-repetir">Repetir la nueva</Label>
              <Input
                id="c-repetir"
                type="password"
                value={claves.repetir}
                onChange={(e) => setClaves({ ...claves, repetir: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setDialogoClave(false)}>
              Cancelar
            </Button>
            <Button
              className="rounded-full bg-purple-700 hover:bg-purple-800"
              onClick={cambiarClave}
              disabled={cambiandoClave}
            >
              {cambiandoClave && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cambiar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Diálogo: borrar cuenta ────────────────────────────────────── */}
      <Dialog open={dialogoBorrar} onOpenChange={setDialogoBorrar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar tu cuenta?</DialogTitle>
            <DialogDescription>
              Se borran tu nombre, tu correo, tu teléfono y tu dirección. No se puede
              deshacer. Si tienes pedidos hechos, el historial de esas compras se
              conserva y la cuenta no se puede borrar desde acá.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setDialogoBorrar(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={borrarCuenta}
              disabled={borrando}
            >
              {borrando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  )
}
