"use client"

import { useState, useEffect } from "react"
import { comoLista } from "@/lib/lista"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Users, 
  Package, 
  ShoppingCart,
  Star,
  DollarSign,
  TrendingUp,
  Clock,
  BarChart as BarChartIcon,
  Mail as MailIcon,
  Tag,
  ChevronDown
} from "lucide-react"
import Link from "next/link";
import ImageUpload from "@/components/image-upload";
import type { Product } from "@/types/product"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/auth-context"
import AdminGuard from "@/components/admin-guard"
import React from "react"

function MassMailTab() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  if (!user?.isAdmin) {
    return <div className="p-8 text-center text-red-600 font-bold">Acceso denegado</div>;
  }

  const handleSend = async () => {
    setSending(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/mass-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("¡Correos enviados exitosamente!");
        setSubject("");
        setMessage("");
      } else {
        setError(data.error || "Error desconocido");
      }
    } catch (e) {
      setError("Error de red o servidor");
    } finally {
      setSending(false);
    }
  };

  return <FormularioCorreos />;
}

/** Redacción y envío del correo a todas las clientas. */
function FormularioCorreos() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<{ total: number; correoListo: boolean; motivo: string | null } | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [htmlPrevio, setHtmlPrevio] = useState<string>("");
  const [cargandoPrevia, setCargandoPrevia] = useState(false);

  // Saber a cuánta gente le va a llegar ANTES de escribir nada.
  useEffect(() => {
    fetch("/api/admin/mass-mail", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setInfo(d))
      .catch(() => {});
  }, []);

  /*
    La vista previa la arma el SERVIDOR con la misma plantilla del envío, así
    que lo que se ve acá es literalmente el correo que va a recibir la clienta.
    La anterior pintaba el mensaje crudo dentro de la página con
    `dangerouslySetInnerHTML`: sin el marco de Mautik, con los estilos del
    panel encima, y no se parecía en nada.
  */
  useEffect(() => {
    if (!message.trim()) { setHtmlPrevio(""); return; }
    setCargandoPrevia(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/mass-mail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ subject, message, soloVistaPrevia: true }),
        });
        const d = await res.json();
        if (res.ok) setHtmlPrevio(d.html || "");
      } catch {} finally { setCargandoPrevia(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [message, subject]);

  const enviar = async () => {
    setSending(true); setError(null); setResultado(null); setConfirmando(false);
    try {
      const res = await fetch("/api/admin/mass-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "No se pudo enviar."); return; }
      setResultado(data.message);
      setSubject(""); setMessage("");
    } catch {
      setError("Error de conexión.");
    } finally {
      setSending(false);
    }
  };

  const listo = subject.trim().length >= 3 && message.trim().length >= 10;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-purple-100 bg-card p-6 dark:border-white/10 sm:p-8">
        <h2 className="font-display text-xl font-bold text-purple-900 dark:text-purple-100">
          Escribirle a tus clientas
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-purple-100/70">
          {info
            ? info.correoListo
              ? `Le va a llegar a ${info.total} ${info.total === 1 ? "persona" : "personas"} con cuenta en Mautik. Cada una recibe su propio correo: nadie ve las direcciones de las demás.`
              : `No se puede enviar todavía: ${info.motivo}.`
            : "Cargando…"}
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="asunto" className="mb-2 block text-sm font-medium text-purple-900 dark:text-purple-100">
              Asunto
            </label>
            <Input id="asunto" value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej.: Llegaron piezas nuevas" className="h-11 rounded-xl" />
          </div>
          <div>
            <label htmlFor="mensaje" className="mb-2 block text-sm font-medium text-purple-900 dark:text-purple-100">
              Mensaje
            </label>
            <Textarea id="mensaje" rows={10} value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder={"Cuéntales qué hay de nuevo…\n\nPuedes usar HTML:\n<b>negrita</b>  <a href=\"...\">un enlace</a>\n<p style=\"color:#5b21b6\">texto con color</p>"}
              className="min-h-[200px] rounded-2xl font-mono text-sm" />

            {/* Atajos para no tener que acordarse de las etiquetas */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {[
                { t: "Negrita", ins: "<b>texto</b>" },
                { t: "Título", ins: '<h2 style="color:#5b21b6;font-size:18px;">Título</h2>' },
                { t: "Párrafo", ins: "<p>Escribí acá…</p>" },
                { t: "Botón", ins: '<a href="https://mautik-web.vercel.app/shop" style="display:inline-block;padding:12px 24px;background:#5b21b6;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;">Ver la tienda</a>' },
                { t: "Separador", ins: '<hr style="border:none;border-top:1px solid #e9e2f5;margin:20px 0;">' },
              ].map((b) => (
                <button key={b.t} type="button"
                  onClick={() => setMessage((m) => `${m}${m && !m.endsWith("\n") ? "\n" : ""}${b.ins}\n`)}
                  className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-900 transition-colors hover:bg-purple-200 dark:bg-white/10 dark:text-purple-100 dark:hover:bg-white/15">
                  + {b.t}
                </button>
              ))}
            </div>

            {/* Subir una foto e insertarla en el mensaje. Va a Cloudinary, la
                misma cuenta que usan las fotos de producto, así que la imagen
                queda con una URL pública que el correo puede mostrar. */}
            <div className="mt-3 rounded-2xl bg-purple-50 p-3 dark:bg-white/5">
              <p className="mb-2 text-xs font-medium text-purple-900 dark:text-purple-100">
                Agregar una imagen al correo
              </p>
              <ImageUpload
                onImageUpload={(url: string) =>
                  setMessage((m) => `${m}${m && !m.endsWith("\n") ? "\n" : ""}<img src="${url}" alt="" style="max-width:100%;border-radius:14px;margin:12px 0;">\n`)
                }
              />
            </div>

            <p className="mt-2 text-xs text-gray-500 dark:text-purple-100/50">
              Acepta HTML con estilos en línea. Se quitan <code>&lt;script&gt;</code> y
              cosas parecidas, que los correos no ejecutan igual y hacen que el mensaje
              caiga en spam.
            </p>
          </div>

          {message.trim() && (
            <div>
              <p className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-purple-900/60 dark:text-purple-100/50">
                <span>Así lo van a ver</span>
                {cargandoPrevia && <span className="normal-case tracking-normal">actualizando…</span>}
              </p>
              <div className="overflow-hidden rounded-2xl border border-purple-100 dark:border-white/10">
                <div className="border-b border-purple-100 bg-purple-50 px-4 py-2.5 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-purple-100/50">Asunto</p>
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                    {subject || "(sin asunto)"}
                  </p>
                </div>
                {/*
                  Va en un iframe a propósito: el correo trae sus propios
                  estilos y, metido directo en la página, el CSS del panel se
                  le encima y se ve distinto de como llega. Dentro del iframe
                  se renderiza aislado, igual que en Gmail.
                */}
                <iframe
                  title="Vista previa del correo"
                  srcDoc={`<!doctype html><html><body style="margin:0;padding:20px;background:#fff;">${htmlPrevio}</body></html>`}
                  sandbox=""
                  className="h-[420px] w-full bg-white"
                />
              </div>
            </div>
          )}

          {/*
            Confirmación en dos pasos a propósito: esto le escribe a gente de
            verdad y no hay forma de deshacerlo.
          */}
          {!confirmando ? (
            <Button type="button" className="h-12 w-full rounded-full text-base"
              disabled={!listo || sending || !info?.correoListo}
              onClick={() => setConfirmando(true)}>
              <MailIcon className="mr-2 h-4 w-4" />
              Enviar a {info?.total ?? 0} {info?.total === 1 ? "clienta" : "clientas"}
            </Button>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/25 dark:bg-amber-400/10">
              <p className="mb-3 text-sm text-amber-900 dark:text-amber-100">
                Se va a enviar a <strong>{info?.total}</strong> {info?.total === 1 ? "persona" : "personas"}.
                Esto no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <Button className="flex-1 rounded-full" disabled={sending} onClick={enviar}>
                  {sending ? "Enviando…" : "Sí, enviar"}
                </Button>
                <Button variant="outline" className="flex-1 rounded-full" disabled={sending}
                  onClick={() => setConfirmando(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {resultado && (
            <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
              {resultado}
            </p>
          )}
          {error && (
            <p className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-800 dark:bg-red-400/10 dark:text-red-200">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface User {
  _id?: string
  id?: string
  name: string
  email: string
  isAdmin: boolean
  avatar?: string
  phone?: string
  address?: any
  createdAt?: Date
}

interface Order {
  _id?: string
  id?: string
  user: User
  items: Array<{
    product: Product
    quantity: number
    price: number
  }>
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  isPaid?: boolean
  createdAt: Date
  shippingAddress: any
  paymentMethod: string
}

interface Metrics {
  totalSales: number
  totalProducts: number
  totalUsers: number
  pendingOrders: number
  salesGrowth: number
}

export default function AdminPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [ocultando, setOcultando] = useState<string | null>(null)

  /** Oculta o vuelve a mostrar un producto, sin borrarlo. */
  const alternarVisible = async (id: string, estaVisible: boolean) => {
    setOcultando(id)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visible: !estaVisible }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (String(p.id) === id ? { ...p, visible: !estaVisible } : p)),
        )
      } else {
        alert(json.error || "No pude cambiar la visibilidad.")
      }
    } catch {
      alert("Error de conexión.")
    } finally {
      setOcultando(null)
    }
  }

  /*
    Confirma un pago recibido por Yappy.

    Llama a la ruta que hace TODO el efecto del cobro (pagado + stock + cupón +
    correo), no al PATCH que solo cambia la etiqueta de estado. Si solo se
    cambiara el estado, el inventario quedaría intacto y se podría vender dos
    veces la misma pieza.
  */
  const confirmarPagoYappy = async (id: string) => {
    if (!confirm("¿Ya viste el dinero en tu Yappy? Esto descuenta el stock y le manda el correo de confirmación a la clienta.")) return
    setConfirmando(id)
    try {
      const res = await fetch(`/api/admin/orders/${id}/confirmar-pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, isPaid: true, status: 'processing' as const } : o)),
        )
        alert(
          json.yaEstabaPagado
            ? "Ese pedido ya estaba pagado."
            : json.avisoStock
              ? "Pago confirmado, pero ojo: algún producto quedó sin stock suficiente."
              : "Pago confirmado. Stock descontado y correo enviado.",
        )
      } else {
        alert(json.error || "No pude confirmar el pago.")
      }
    } catch {
      alert("Error de conexión.")
    } finally {
      setConfirmando(null)
    }
  }
  const [metrics, setMetrics] = useState<Metrics>({
    totalSales: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    salesGrowth: 0
  })
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchProducts, setSearchProducts] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [searchOrders, setSearchOrders] = useState("");
  const [monthlySales, setMonthlySales] = useState<{ month: string; total: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProducts(true);
        setLoadingUsers(true);
        setLoadingOrders(true);

        // Fetch metrics
        const metricsRes = await fetch("/api/admin/metrics");
        if (metricsRes.ok) {
          const data = await metricsRes.json();
          setMetrics(data);
        }

        // Fetch monthly sales
        const monthlySalesRes = await fetch("/api/admin/monthly-sales");
        if (monthlySalesRes.ok) {
          const data = await monthlySalesRes.json();
          setMonthlySales(comoLista(data));
        }

        // Fetch products
        const productsRes = await fetch("/api/admin/products", { credentials: "include" });
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(Array.isArray(data) ? data : (data?.products ?? data?.productos ?? []));
        }

        /*
          Siempre un arreglo, pase lo que pase.

          `/api/admin/orders` pasó a devolver `{ pedidos, total }` para poder
          paginar, y acá se seguía haciendo `setOrders(data)` con el objeto
          entero. Resultado: el panel entero se caía con "A.filter is not a
          function" y no se podía entrar a administración. Si una respuesta
          viene con otra forma —o vacía, o con un error— lo peor que puede
          pasar es que la lista salga vacía, nunca que la página explote.
        */

        const usersRes = await fetch("/api/admin/users", { credentials: "include" });
        if (usersRes.ok) setUsers(comoLista(await usersRes.json(), "usuarios"));

        const ordersRes = await fetch("/api/admin/orders", { credentials: "include" });
        if (ordersRes.ok) setOrders(comoLista(await ordersRes.json(), "pedidos"));

      } catch (error) {
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar los datos del panel de administración.",
          variant: "destructive",
        });
      } finally {
        setLoadingProducts(false);
        setLoadingUsers(false);
        setLoadingOrders(false);
      }
    };

    fetchData();
    /*
      El panel se refrescaba cada 30 segundos aunque estuviera de fondo. Con la
      pestaña abierta todo el día son 2.880 recargas completas del panel
      (productos + pedidos + clientas + métricas) contra la base. Ahora cada 2
      minutos y solo mirando.
    */
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      fetchData()
    }, 120000);
    return () => clearInterval(interval);
  }, [toast]);

  /*
    Los filtros también estaban sin red: `order.user.name` explota en cuanto
    un pedido llega sin usuario (pasa con los pedidos de prueba y con los
    pendientes). Se normaliza todo a texto antes de comparar.
  */
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroStock, setFiltroStock] = useState("todos");
  const [usuarioAbierto, setUsuarioAbierto] = useState<string | null>(null);
  const [claveNueva, setClaveNueva] = useState<Record<string, string>>({});

  const texto = (v: unknown) => String(v ?? "").toLowerCase();
  const lista = (v: unknown) => (Array.isArray(v) ? v : []);

  const filteredProducts = lista(products).filter((product: any) => {
    const coincideTexto =
      texto(product?.name).includes(texto(searchProducts)) ||
      texto(product?.category).includes(texto(searchProducts)) ||
      texto(product?.sku).includes(texto(searchProducts));
    const coincideCat =
      filtroCategoria === "todas" || texto(product?.category) === filtroCategoria;
    const st = Number(product?.stock ?? 0);
    const coincideStock =
      filtroStock === "todos" ||
      (filtroStock === "agotado" && st === 0) ||
      (filtroStock === "poco" && st > 0 && st <= 3) ||
      (filtroStock === "hay" && st > 3);
    return coincideTexto && coincideCat && coincideStock;
  });

  const filteredUsers = lista(users).filter((user: any) =>
    texto(user?.name).includes(texto(searchUsers)) ||
    texto(user?.email).includes(texto(searchUsers))
  );

  const filteredOrders = lista(orders).filter((order: any) =>
    texto(order?.user?.name).includes(texto(searchOrders)) ||
    texto(order?.user?.email).includes(texto(searchOrders))
  );

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        toast({ title: "Producto eliminado", description: "El producto se ha eliminado exitosamente." });
      } else {
        const errorData = await res.json();
        toast({ title: "Error al eliminar producto", description: errorData.error || "Error desconocido" });
      }
    } catch (e) {
      toast({ title: "Error de red o servidor", description: "No se pudo eliminar el producto." });
    }
  };

  /** Cambia el rol de una clienta (Cliente <-> Administradora). */
  const handleToggleUserRole = async (id: string, seraAdmin: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isAdmin: seraAdmin }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "No se pudo cambiar", description: data?.error, variant: "destructive" });
        return;
      }
      setUsers((lista: any[]) => lista.map((u) => (String(u._id || u.id) === id ? { ...u, isAdmin: seraAdmin } : u)));
      toast({ title: seraAdmin ? "Ahora es administradora" : "Ahora es cliente" });
    } catch {
      toast({ title: "Error de red", variant: "destructive" });
    }
  };

  /** Le pone una contraseña nueva a una clienta. */
  const cambiarClave = async (id: string, clave: string) => {
    if (clave.trim().length < 6) {
      toast({ title: "Muy corta", description: "Mínimo 6 caracteres.", variant: "destructive" });
      return false;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: clave }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "No se pudo cambiar", description: data?.error, variant: "destructive" });
        return false;
      }
      toast({ title: "Contraseña actualizada", description: "Acuérdate de pasársela a la clienta." });
      return true;
    } catch {
      toast({ title: "Error de red", variant: "destructive" });
      return false;
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setUsers((lista: any[]) => lista.filter((u) => String(u._id || u.id) !== id));
        toast({ title: "Usuario eliminado", description: "El usuario se ha eliminado exitosamente." });
      } else {
        const errorData = await res.json();
        toast({ title: "Error al eliminar usuario", description: errorData.error || "Error desconocido" });
      }
    } catch (e) {
      toast({ title: "Error de red o servidor", description: "No se pudo eliminar el usuario." });
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto p-6 space-y-6">
        {/*
          Cabecera limpia.

          Antes tenía tres botones sueltos al lado del título: "Pedidos",
          "Productos" y "Limpiar localStorage". Los dos primeros duplicaban
          pestañas que ya están abajo —era raro tener Pedidos acá Y como
          pestaña—, y el tercero es una herramienta de depuración que no pinta
          nada en un panel de trabajo.
        */}
        <div>
          <h1 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-50">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-purple-100/70">
            Mautik · {metrics.totalProducts} productos · {metrics.totalUsers} clientas registradas
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          {/* Píldoras en una fila que se desliza: con siete pestañas, el
              grid de 7 columnas dejaba etiquetas ilegibles en el celular. */}
          <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl bg-purple-50 p-1.5 dark:bg-white/5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { v: "dashboard", t: "Resumen", I: TrendingUp },
              { v: "products", t: "Productos", I: Package },
              { v: "orders", t: "Pedidos", I: ShoppingCart },
              { v: "users", t: "Clientas", I: Users },
              { v: "coupons", t: "Cupones", I: Tag },
              { v: "analytics", t: "Métricas", I: BarChartIcon },
              { v: "mass-mail", t: "Correos", I: MailIcon },
            ].map(({ v, t, I }) => (
              <TabsTrigger
                key={v}
                value={v}
                className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-purple-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/15 dark:data-[state=active]:text-purple-50"
              >
                <I size={16} />
                <span>{t}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Tarjetas de resumen: número grande, icono en su propio
                círculo de color y una línea de contexto. Antes eran cuatro
                cajas grises iguales donde el dato no resaltaba. */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { t: "Ventas totales", v: `$${metrics.totalSales.toFixed(2)}`,
                  d: `${metrics.salesGrowth > 0 ? "+" : ""}${metrics.salesGrowth.toFixed(1)}% vs. mes pasado`,
                  I: DollarSign, c: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300" },
                { t: "Pedidos por atender", v: String(metrics.pendingOrders),
                  d: metrics.pendingOrders > 0 ? "Necesitan que los envíes" : "Todo al día",
                  I: Clock, c: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300" },
                { t: "Productos", v: String(metrics.totalProducts), d: "En el catálogo",
                  I: Package, c: "bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300" },
                { t: "Clientas", v: String(metrics.totalUsers), d: "Con cuenta creada",
                  I: Users, c: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300" },
              ].map(({ t, v, d, I, c }) => (
                <div key={t} className="rounded-3xl border border-purple-100 bg-card p-5 dark:border-white/10">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-purple-100/70">{t}</span>
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${c}`}>
                      <I className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="font-display text-3xl font-bold tabular-nums text-purple-900 dark:text-purple-50">{v}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-purple-100/50">{d}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-purple-100 bg-card p-6 dark:border-white/10">
              <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                Ventas por mes ({new Date().getFullYear()})
              </h2>
              <p className="mb-5 text-sm text-gray-600 dark:text-purple-100/60">
                Suma de los pedidos entregados en cada mes.
              </p>
              {monthlySales.every((m: any) => !m?.total) ? (
                /* Un gráfico con todas las barras en cero confunde: parece
                   roto. Mejor decirlo con palabras. */
                <div className="flex flex-col items-center rounded-2xl bg-purple-50 py-14 text-center dark:bg-white/5">
                  <BarChartIcon className="mb-2 h-8 w-8 text-purple-300" />
                  <p className="text-sm text-gray-600 dark:text-purple-100/70">
                    Todavía no hay ventas entregadas este año.
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-purple-100/50">
                    El gráfico aparece con el primer pedido que marques como entregado.
                  </p>
                </div>
              ) : (
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySales} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(124,58,237,0.15)" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, "Ventas"]}
                        contentStyle={{ borderRadius: 14, border: "1px solid rgba(124,58,237,0.2)" }}
                      />
                      <Bar dataKey="total" fill="#7c3aed" radius={[8, 8, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Productos */}
          <TabsContent value="products" className="space-y-6">
            {/*
              El buscador estaba solo, sin ninguna forma de acotar. Con 68
              productos, encontrar "los que están agotados" o "todas las
              pulseras" obligaba a leer la tabla entera. Ahora hay dos filtros
              al lado, que además muestran cuántos quedan.
            */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full min-w-[200px] sm:flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
                  <Input
                    placeholder="Buscar por nombre, categoría o SKU…"
                    value={searchProducts}
                    onChange={(e) => setSearchProducts(e.target.value)}
                    className="h-11 rounded-full pl-10"
                  />
                </div>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  aria-label="Filtrar por categoría"
                  className="h-11 min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 sm:flex-none"
                >
                  <option value="todas">Todas las categorías</option>
                  {["crochet","llaveros","pulseras","collares","anillos","aretes","otros"].map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                <select
                  value={filtroStock}
                  onChange={(e) => setFiltroStock(e.target.value)}
                  aria-label="Filtrar por stock"
                  className="h-11 min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 sm:flex-none"
                >
                  <option value="todos">Todo el stock</option>
                  <option value="agotado">Agotados</option>
                  <option value="poco">Quedan 3 o menos</option>
                  <option value="hay">Con stock</option>
                </select>
                <Button className="h-11 w-full rounded-full sm:w-auto" asChild>
                  <Link href="/admin/products/new"><Plus className="mr-1.5 h-4 w-4" /> Nuevo producto</Link>
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-purple-100/60">
                {filteredProducts.length} de {lista(products).length} productos
                {(filtroCategoria !== "todas" || filtroStock !== "todos" || searchProducts) && (
                  <button
                    type="button"
                    onClick={() => { setSearchProducts(""); setFiltroCategoria("todas"); setFiltroStock("todos"); }}
                    className="ml-3 font-medium text-purple-700 underline-offset-2 hover:underline dark:text-purple-300"
                  >
                    Quitar filtros
                  </button>
                )}
              </p>
            </div>
            <Card className="rounded-3xl border-purple-100 shadow-none dark:border-white/10">
              <CardHeader>
                <CardTitle>Gestión de Productos</CardTitle>
                <CardDescription>
                  Administra los productos de la tienda
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className="text-center py-8">Cargando productos...</div>
                ) : (
                  <Table>
                    <TableHeader className="hidden sm:table-header-group">
                      <TableRow>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Etiquetas</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id} className="relative mb-2.5 flex min-h-[96px] flex-col gap-0.5 rounded-2xl border border-purple-100 bg-card p-3 pl-[84px] shadow-sm sm:mb-0 sm:table-row sm:min-h-0 sm:gap-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:pl-0 sm:shadow-none dark:border-white/10">
                          <TableCell className="absolute left-3 top-3 p-0 sm:static sm:table-cell sm:py-3">
                            
                            {/* Antes era un cuadrado de 64px con la foto a
                                sangre y sin fondo: contra la tabla se leía como
                                un marco negro duro. Ahora va en proporción 3:4
                                —la misma de la tienda—, con fondo suave y borde
                                apenas insinuado. */}
                            <div className="h-20 w-15 shrink-0 overflow-hidden rounded-xl bg-purple-50 ring-1 ring-purple-100 dark:bg-white/5 dark:ring-white/10" style={{ width: 60 }}>
                              <img
                                src={product.images?.[0] || "/placeholder.jpg"}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                            
                            <span className="block pr-16 text-sm font-medium leading-snug sm:pr-0 sm:text-base">{product.name}</span>
                          </TableCell>
                          <TableCell className="flex items-center gap-2 py-0 text-xs capitalize text-gray-500 dark:text-purple-100/50 sm:table-cell sm:py-3 sm:text-sm sm:normal-case sm:text-inherit">
                            {product.category}
                          </TableCell>
                          <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                            
                            ${product.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="flex flex-wrap items-center gap-1.5 py-0.5 sm:table-cell sm:py-3">
                            {/* En móvil, stock y etiquetas comparten esta misma
                                línea: antes ocupaban dos renglones cada una. */}
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                                product.stock === 0
                                  ? "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300"
                                  : product.stock <= 3
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                              }`}
                            >
                              {product.stock === 0 ? "Agotado" : `${product.stock} ${product.stock === 1 ? "unidad" : "unidades"}`}
                            </span>
                            <span className="flex flex-wrap gap-1 sm:hidden [&>*]:px-2 [&>*]:py-0.5 [&>*]:text-[10px]">
                              {product.isNew && <Badge variant="secondary">Nuevo</Badge>}
                              {product.featured && <Badge variant="outline">Destacado</Badge>}
                              {(product.discount || 0) > 0 && <Badge variant="destructive">-{product.discount}%</Badge>}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell sm:py-3">
                            <div className="flex flex-wrap gap-1">
                              {product.isNew && <Badge variant="secondary">Nuevo</Badge>}
                              {product.featured && <Badge variant="outline">Destacado</Badge>}
                              {(product.discount || 0) > 0 && (
                                <Badge variant="destructive">-{product.discount}%</Badge>
                              )}
                              {product.visible === false && (
                                <Badge className="border-none bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">
                                  Oculto
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="absolute right-2.5 top-2.5 mt-0 flex gap-1.5 p-0 sm:static sm:table-cell sm:py-3">
                            
                            <div className="flex gap-1.5 sm:gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0 sm:h-9 sm:w-auto sm:px-3" asChild>
                                <Link href={`/admin/products/${product.id}/edit`} aria-label={`Editar ${product.name}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              {/*
                                Ocultar en vez de borrar.

                                Borrar una pieza que ya se vendió rompe el
                                historial del pedido que la incluye. Ocultarla
                                la saca de la tienda y la deja lista para
                                volver cuando se rehaga la foto o vuelva la
                                temporada.
                              */}
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={product.visible === false ? `Mostrar ${product.name}` : `Ocultar ${product.name}`}
                                title={product.visible === false ? "Está oculto · tocar para mostrarlo" : "Ocultar de la tienda"}
                                className="h-8 w-8 rounded-full p-0 sm:h-9 sm:w-auto sm:px-3"
                                disabled={ocultando === String(product.id)}
                                onClick={() => alternarVisible(String(product.id), product.visible !== false)}
                              >
                                {product.visible === false ? (
                                  <EyeOff className="h-4 w-4 text-amber-600" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={`Eliminar ${product.name}`}
                                className="h-8 w-8 rounded-full p-0 text-red-600 hover:bg-red-50 hover:text-red-700 sm:h-9 sm:w-auto sm:px-3 dark:hover:bg-red-400/10"
                                onClick={() => handleDeleteProduct(String(product.id))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usuarios */}
          <TabsContent value="users" className="space-y-6">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
              <Input
                placeholder="Buscar clientas por nombre o correo…"
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="h-11 rounded-full pl-10"
              />
            </div>

            {/*
              Antes era una tabla con cinco columnas por clienta: en tablet y
              móvil cada fila se convertía en una tarjeta altísima con todo
              desplegado. Ahora cada clienta es una línea compacta y los
              detalles se abren al tocarla.
            */}
            <div className="rounded-3xl border border-purple-100 bg-card dark:border-white/10">
              {loadingUsers ? (
                <p className="py-10 text-center text-sm text-gray-500 dark:text-purple-100/60">Cargando…</p>
              ) : filteredUsers.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500 dark:text-purple-100/60">
                  No hay clientas con ese nombre o correo.
                </p>
              ) : (
                <ul className="divide-y divide-purple-100 dark:divide-white/10">
                  {filteredUsers.map((u: any) => {
                    const uid = String(u._id || u.id);
                    const abierta = usuarioAbierto === uid;
                    return (
                      <li key={uid}>
                        <button
                          type="button"
                          onClick={() => setUsuarioAbierto(abierta ? null : uid)}
                          aria-expanded={abierta}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-purple-50/60 dark:hover:bg-white/5"
                        >
                          <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-purple-100 ring-1 ring-purple-200 dark:bg-white/10 dark:ring-white/15">
                            <img src={u.avatar || "/placeholder-user.jpg"} alt="" className="h-full w-full object-cover" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-purple-900 dark:text-purple-100">
                              {u.name || "Sin nombre"}
                            </span>
                            <span className="block truncate text-xs text-gray-500 dark:text-purple-100/50">{u.email}</span>
                          </span>
                          {u.isAdmin && (
                            <Badge className="shrink-0 border-none bg-purple-100 text-purple-900 dark:bg-purple-400/20 dark:text-purple-100">
                              Admin
                            </Badge>
                          )}
                          <ChevronDown className={`h-4 w-4 shrink-0 text-purple-400 transition-transform ${abierta ? "rotate-180" : ""}`} />
                        </button>

                        {abierta && (
                          <div className="border-t border-purple-100 bg-purple-50/40 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                            {/*
                              Compacto a propósito: tres controles en una fila.
                              La fecha de registro se quitó, no se usa para nada.
                            */}
                            <div className="flex flex-wrap items-end gap-2">
                              <div className="min-w-[150px] flex-1">
                                <label className="mb-1 block text-xs text-gray-500 dark:text-purple-100/50">Rol</label>
                                <select
                                  value={u.isAdmin ? "admin" : "cliente"}
                                  onChange={(e) => handleToggleUserRole(uid, e.target.value === "admin")}
                                  className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="cliente">Cliente</option>
                                  <option value="admin">Administradora</option>
                                </select>
                              </div>

                              <div className="min-w-[170px] flex-[2]">
                                <label className="mb-1 block text-xs text-gray-500 dark:text-purple-100/50">
                                  Contraseña nueva
                                </label>
                                <div className="flex gap-2">
                                  <Input
                                    type="text"
                                    placeholder="Mínimo 6 caracteres"
                                    value={claveNueva[uid] ?? ""}
                                    onChange={(e) => setClaveNueva((c) => ({ ...c, [uid]: e.target.value }))}
                                    className="h-9 rounded-lg text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    className="h-9 shrink-0 rounded-lg"
                                    disabled={(claveNueva[uid] ?? "").trim().length < 6}
                                    onClick={async () => {
                                      const ok = await cambiarClave(uid, claveNueva[uid] ?? "");
                                      if (ok) setClaveNueva((c) => ({ ...c, [uid]: "" }));
                                    }}
                                  >
                                    Cambiar
                                  </Button>
                                </div>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={`Eliminar la cuenta de ${u.name}`}
                                className="h-9 shrink-0 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-400/10"
                                onClick={() => handleDeleteUser(uid)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="mt-2 text-xs text-gray-400 dark:text-purple-100/40">
                              Cuenta creada el{" "}
                              {u.createdAt
                                ? new Date(u.createdAt).toLocaleDateString("es-PA", {
                                    day: "2-digit", month: "long", year: "numeric",
                                  })
                                : "—"}
                            </p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </TabsContent>

          {/* Pedidos */}
          <TabsContent value="orders" className="space-y-6">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
              <Input
                placeholder="Buscar pedidos por clienta o correo…"
                value={searchOrders}
                onChange={(e) => setSearchOrders(e.target.value)}
                className="h-11 rounded-full pl-10"
              />
            </div>

            <Card className="rounded-3xl border-purple-100 shadow-none dark:border-white/10">
              <CardHeader>
                <CardTitle>Gestión de Pedidos</CardTitle>
                <CardDescription>
                  Administra los pedidos de los clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="text-center py-8">Cargando pedidos...</div>
                ) : (
                  <Table>
                    <TableHeader className="hidden sm:table-header-group">
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Productos</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order._id} className="relative mb-2.5 flex min-h-[96px] flex-col gap-0.5 rounded-2xl border border-purple-100 bg-card p-3 pl-[84px] shadow-sm sm:mb-0 sm:table-row sm:min-h-0 sm:gap-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:pl-0 sm:shadow-none dark:border-white/10">
                          <TableCell className="absolute left-3 top-3 p-0 sm:static sm:table-cell sm:py-3">
                            <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Cliente:</span>
                            <div>
                              <p className="font-medium">{order.user.name}</p>
                              <p className="text-sm text-muted-foreground">{order.user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                            <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Productos:</span>
                            <div className="text-sm">
                              {order.items.length} productos
                            </div>
                          </TableCell>
                          <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                            <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Total:</span>
                            <div className="font-medium">
                              ${order.total.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                            <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Estado:</span>
                            <Badge variant={
                              order.status === 'pending' ? 'secondary' :
                              order.status === 'processing' ? 'default' :
                              order.status === 'shipped' ? 'outline' :
                              order.status === 'delivered' ? 'default' :
                              'destructive'
                            }>
                              {order.status === 'pending' ? 'Pendiente' :
                               order.status === 'processing' ? 'Procesando' :
                               order.status === 'shipped' ? 'Enviado' :
                               order.status === 'delivered' ? 'Entregado' :
                               'Cancelado'}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                            <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Fecha:</span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="absolute right-2.5 top-2.5 mt-0 flex gap-1.5 p-0 sm:static sm:table-cell sm:py-3">
                            {/*
                              Confirmar un pago de Yappy.

                              Mientras el Botón de Pago no esté habilitado, la
                              clienta paga al número de Mautik desde su app y
                              acá se confirma al ver el dinero. Este botón NO
                              es el mismo que cambiar el estado a "pagado": eso
                              solo cambia la etiqueta. Este descuenta el stock,
                              consume el cupón y manda el correo, igual que
                              hace PayPal cuando cobra.
                            */}
                            <div className="flex gap-1.5 sm:gap-2">
                              {!order.isPaid && (
                                <Button
                                  size="sm"
                                  className="w-full rounded-full bg-purple-700 text-xs hover:bg-purple-800 sm:w-auto"
                                  disabled={confirmando === order._id}
                                  onClick={() => confirmarPagoYappy(order._id)}
                                >
                                  {confirmando === order._id ? "Confirmando…" : "Confirmar pago"}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cupones..."
                  value={searchProducts} // Reusing searchProducts for now, as no specific coupon search field exists
                  onChange={(e) => setSearchProducts(e.target.value)}
                  className="w-64"
                />
              </div>
              <Button variant="default" asChild>
                <Link href="/admin/coupons/new">+ Nuevo Cupón</Link>
              </Button>
            </div>
            <Card className="rounded-3xl border-purple-100 shadow-none dark:border-white/10">
              <CardHeader>
                <CardTitle>Gestión de Cupones</CardTitle>
                <CardDescription>
                  Administra los cupones de descuento disponibles para los usuarios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Reusing loadingProducts for now */}
                {loadingProducts ? (
                  <div className="text-center py-8">Cargando cupones...</div>
                ) : (
                  <Table>
                    <TableHeader className="hidden sm:table-header-group">
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Placeholder for coupon data */}
                      <TableRow className="relative mb-2.5 flex min-h-[96px] flex-col gap-0.5 rounded-2xl border border-purple-100 bg-card p-3 pl-[84px] shadow-sm sm:mb-0 sm:table-row sm:min-h-0 sm:gap-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:pl-0 sm:shadow-none dark:border-white/10">
                        <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                          <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Código:</span>
                          <span>SUMMER2023</span>
                        </TableCell>
                        <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                          <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Tipo:</span>
                          <span>Porcentaje</span>
                        </TableCell>
                        <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                          <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Valor:</span>
                          <span>10%</span>
                        </TableCell>
                        <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                          <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Estado:</span>
                          <Badge variant="default">Activo</Badge>
                        </TableCell>
                        <TableCell className="absolute right-2.5 top-2.5 mt-0 flex gap-1.5 p-0 sm:static sm:table-cell sm:py-3">
                          
                          <div className="flex gap-1.5 sm:gap-2">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="relative mb-2.5 flex min-h-[96px] flex-col gap-0.5 rounded-2xl border border-purple-100 bg-card p-3 pl-[84px] shadow-sm sm:mb-0 sm:table-row sm:min-h-0 sm:gap-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:pl-0 sm:shadow-none dark:border-white/10">
                        <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                          <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Código:</span>
                          <span>WELCOME10</span>
                        </TableCell>
                        <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                          <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Tipo:</span>
                          <span>Fijo</span>
                        </TableCell>
                        <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                          <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Valor:</span>
                          <span>$10</span>
                        </TableCell>
                        <TableCell className="flex items-center gap-2 py-1 sm:table-cell sm:py-3">
                          <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-purple-100/50 sm:hidden">Estado:</span>
                          <Badge variant="secondary">Inactivo</Badge>
                        </TableCell>
                        <TableCell className="absolute right-2.5 top-2.5 mt-0 flex gap-1.5 p-0 sm:static sm:table-cell sm:py-3">
                          
                          <div className="flex gap-1.5 sm:gap-2">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Antes era una tarjeta con un párrafo genérico y un botón. Ahora
                adelanta los números que ya tenemos y deja el enlace al detalle. */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { t: "Ticket promedio", v: lista(orders).filter((o: any) => o?.isPaid).length > 0
                    ? `$${(metrics.totalSales / lista(orders).filter((o: any) => o?.isPaid).length).toFixed(2)}` : "—",
                  d: "Por pedido pagado" },
                { t: "Pedidos totales", v: String(lista(orders).length), d: "Desde que abrió la tienda" },
                { t: "Productos agotados", v: String(lista(products).filter((p: any) => Number(p?.stock) === 0).length),
                  d: "Hay que reponerlos" },
              ].map(({ t, v, d }) => (
                <div key={t} className="rounded-3xl border border-purple-100 bg-card p-5 dark:border-white/10">
                  <p className="text-sm font-medium text-gray-600 dark:text-purple-100/70">{t}</p>
                  <p className="mt-2 font-display text-3xl font-bold tabular-nums text-purple-900 dark:text-purple-50">{v}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-purple-100/50">{d}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-purple-100 bg-card p-6 dark:border-white/10">
              <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Métricas detalladas</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-purple-100/70">
                Productos más vendidos, evolución de las ventas y comportamiento
                de las visitas.
              </p>
              <Button className="mt-5 rounded-full" asChild>
                <Link href="/admin/analytics">
                  <BarChartIcon className="mr-2 h-4 w-4" /> Abrir métricas
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Envío Masivo */}
          <TabsContent value="mass-mail" className="space-y-6">
            <MassMailTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  )
}
