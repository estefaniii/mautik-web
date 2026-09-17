"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, ShieldCheck, Truck, Heart, Tag, X } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"

const CartRecommendations = dynamic(() => import("@/components/cart-recommendations"), { ssr: false })

function CartContent() {
  const { cart, updateQuantity, removeFromCart,
          selectedItems, isSelected, toggleSelected, setAllSelected,
          codigoCupon, guardarCupon } = useCart()
  const { toast } = useToast()
  const [discount, setDiscount] = useState(0)
  const [textoCupon, setTextoCupon] = useState("")
  const [cuponError, setCuponError] = useState<string | null>(null)
  const [validandoCupon, setValidandoCupon] = useState(false)
  const [stockMessages, setStockMessages] = useState<{ [id: string]: string }>({})
  const prevStocks = useRef<{ [id: string]: number }>({})

  /*
    Los totales salen de lo SELECCIONADO, no del carrito entero.

    El carrito funciona como el de Temu: guarda todo lo que fuiste juntando y
    con las casillas decís qué te llevás ahora. Lo que dejás sin marcar no se
    cobra y no se borra.
  */
  /*
    El envío NO se inventa acá.

    Antes esta línea era `selectedItems.length > 0 ? 10 : 0`: un envío fijo de
    $10 que no existe. El real se calcula en el pago con la dirección y va de
    $1.50 (entrega personal en La Chorrera) a $15 (Bocas del Toro), así que el
    carrito le enseñaba a la clienta un total que casi nunca era el suyo, y
    siempre de los caros. Ahora dice que se calcula al pagar.
  */
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = Math.max(0, subtotal - discount)
  /*
    Cupones DE VERDAD.

    Antes esta caja era decorado: `handleApplyCoupon` ponía el descuento en 0 y
    avisaba "Cupón inválido" sin comprobar nada, pasara lo que pasara. Y aunque
    hubiera comprobado, el pago no sabía de descuentos: se habría prometido una
    rebaja que al cobrar no aparecía.

    Ahora se le pregunta al servidor cuánto descuenta sobre lo que está marcado
    en este momento, y se vuelve a preguntar si cambia la selección. Lo que se
    ve acá es informativo: el monto que se cobra lo recalcula el servidor al
    crear el pedido, con el mismo código.
  */
  const comprobarCupon = useCallback(
    async (codigo: string, avisar: boolean) => {
      if (!codigo) return
      if (selectedItems.length === 0) {
        setDiscount(0)
        return
      }
      setValidandoCupon(true)
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: codigo,
            subtotal,
            items: selectedItems.map((i) => ({
              productId: i.id,
              category: (i as any).category,
              subtotal: i.price * i.quantity,
            })),
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          setDiscount(data.discount || 0)
          setCuponError(null)
          guardarCupon(data.coupon?.code ?? codigo.toUpperCase())
          if (avisar) {
            toast({
              title: `Cupón aplicado: −$${(data.discount || 0).toFixed(2)}`,
              description: data.descripcion || undefined,
            })
          }
        } else {
          setDiscount(0)
          setCuponError(data.error || "Ese cupón no se puede usar.")
          guardarCupon(null)
        }
      } catch {
        setDiscount(0)
        setCuponError("No se pudo comprobar el cupón.")
      } finally {
        setValidandoCupon(false)
      }
    },
    [subtotal, selectedItems, guardarCupon, toast],
  )

  // Si ya había un cupón puesto, se revalida al entrar y cada vez que cambia
  // lo marcado: un cupón con compra mínima deja de valer si se desmarca algo.
  useEffect(() => {
    if (codigoCupon) {
      setTextoCupon(codigoCupon)
      comprobarCupon(codigoCupon, false)
    } else {
      setDiscount(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigoCupon, subtotal, selectedItems.length])

  const quitarCupon = () => {
    guardarCupon(null)
    setTextoCupon("")
    setDiscount(0)
    setCuponError(null)
  }

  const todosMarcados = cart.length > 0 && selectedItems.length === cart.length
  const unidadesMarcadas = selectedItems.reduce((n, i) => n + i.quantity, 0)
  /*
    "11 artículos" con tres productos en el carrito se lee como si hubiera
    once cosas distintas. Son once UNIDADES de tres productos, y eso hay que
    decirlo con todas las letras cuando los dos números no coinciden.
  */
  const resumenCantidad =
    selectedItems.length === unidadesMarcadas
      ? `${unidadesMarcadas} ${unidadesMarcadas === 1 ? "producto" : "productos"}`
      : `${selectedItems.length} ${selectedItems.length === 1 ? "producto" : "productos"} · ${unidadesMarcadas} unidades`

  // Polling para actualizar stock de todos los productos cada 20s
  useEffect(() => {
    /*
      Sondeo de stock cada 2 minutos y SOLO con la pestaña a la vista.

      Antes era cada 20 segundos y seguía corriendo con la pestaña de fondo:
      una clienta que dejaba el carrito abierto toda la tarde generaba 180
      consultas por hora, por cada producto del carrito. En el plan gratis de
      Neon eso se paga en horas de base despierta, que es justo lo que agotó
      la cuota y tumbó la tienda. Dos minutos alcanza de sobra para avisar que
      algo se agotó.
    */
    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return
      const updates: { [id: string]: number } = {}
      for (const item of cart) {
        try {
          const res = await fetch(`/api/products/${item.id}`)
          if (res.ok) {
            const data = await res.json()
            if (typeof data.stock === 'number' && data.stock !== item.stock) {
              updates[item.id] = data.stock
              if (data.stock < (prevStocks.current[item.id] ?? item.stock)) {
                setStockMessages(msgs => ({ ...msgs, [item.id]: 'El stock ha bajado, ajustamos tu carrito.' }))
              }
              prevStocks.current[item.id] = data.stock
            }
          }
        } catch {}
      }
      if (Object.keys(updates).length > 0) {
        for (const id in updates) {
          const cartItem = cart.find(i => i.id === id)
          if (cartItem && cartItem.quantity > updates[id]) {
            updateQuantity(id, updates[id])
          }
        }
      }
    }, 120000)
    return () => clearInterval(interval)
  }, [cart])

  // Validar stock antes de aumentar cantidad
  const fetchLatestStock = async (id: string) => {
    const res = await fetch(`/api/products/${id}`)
    if (res.ok) {
      const data = await res.json()
      if (typeof data.stock === 'number') {
        const cartItem = cart.find(i => i.id === id)
        if (data.stock !== cartItem?.stock) {
          if (data.stock < (cartItem?.quantity ?? 0)) {
            updateQuantity(id, data.stock)
            setStockMessages(msgs => ({ ...msgs, [id]: 'El stock ha cambiado, ajustamos tu carrito.' }))
          }
        }
        return data.stock
      }
    }
    return cart.find(i => i.id === id)?.stock || 0
  }

  const handleIncreaseWithStockCheck = async (id: string) => {
    const latestStock = await fetchLatestStock(id)
    const item = cart.find(i => i.id === id)
    if (item && item.quantity < latestStock) {
      updateQuantity(id, item.quantity + 1)
      setStockMessages(msgs => ({ ...msgs, [id]: '' }))
    } else {
      setStockMessages(msgs => ({ ...msgs, [id]: 'No hay más stock disponible.' }))
    }
  }

  const handleDecrease = (id: string) => {
    const item = cart.find(i => i.id === id)
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1)
    }
  }

  const handleIncrease = (id: string) => {
    const item = cart.find(i => i.id === id)
    if (item && item.quantity < item.stock) {
      updateQuantity(id, item.quantity + 1)
    }
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const item = cart.find(i => i.id === id)
    if (newQuantity < 1) newQuantity = 1
    if (item && newQuantity > item.stock) newQuantity = item.stock
    updateQuantity(id, newQuantity)
  }

  const handleRemoveItem = (id: string) => {
    removeFromCart(id)
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado de tu carrito.",
    })
  }

  return (
    <div className={`min-h-screen bg-background py-12 ${cart.length > 0 ? "pb-28 lg:pb-12" : ""}`}>
      <div className="container mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-100 text-center mb-8">Tu Carrito</h1>

        {cart.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-3xl bg-card p-8 text-center shadow-[0_2px_16px_rgba(24,10,48,0.10)] ring-1 ring-purple-100/70 dark:ring-purple-300/15">
            {/*
              Los colores estaban fijos al modo claro: `text-gray-800`,
              `text-gray-600` y un icono `text-purple-200`. En modo oscuro el
              título quedaba gris sobre negro —casi ilegible— y el icono se
              perdía. Ahora cada color tiene su variante.
            */}
            <div className="mb-6 flex justify-center">
              <span className="grid h-24 w-24 place-items-center rounded-full bg-purple-100 dark:bg-white/10">
                <ShoppingBag className="h-11 w-11 text-purple-700 dark:text-purple-300" />
              </span>
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-purple-900 dark:text-purple-100">
              Tu carrito está vacío
            </h2>
            <p className="mb-8 text-gray-600 dark:text-purple-100/70">
              Parece que aún no has añadido productos a tu carrito.
            </p>
            <Button className="rounded-full bg-purple-800 px-8 py-6 text-lg hover:bg-purple-900" asChild>
              <Link href="/shop">Explorar Productos</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="rounded-3xl bg-card p-6 shadow-[0_2px_16px_rgba(24,10,48,0.10)] ring-1 ring-purple-100/70 dark:ring-purple-300/15">
                {/*
                  Sin el título "Productos (3)" ni el botón de vaciar carrito.

                  El título repetía lo que ya dice la línea de abajo
                  ("Seleccionar todo (1 de 3)") y el botón rojo de vaciar era
                  un riesgo sin recompensa: un toque accidental borraba todo lo
                  que la clienta venía juntando. Cada artículo ya tiene su
                  papelera individual.
                */}
                {/* Seleccionar todo / ninguno */}
                {cart.length > 0 && (
                  <label className="-ml-2.5 mb-1 flex cursor-pointer items-center gap-1 text-sm text-gray-700 dark:text-purple-100/80">
                    {/* El relleno del <span> lleva el área de toque a 44px sin agrandar la casilla */}
                    <span className="grid h-11 w-11 place-items-center">
                      <input
                        type="checkbox"
                        checked={todosMarcados}
                        onChange={(e) => setAllSelected(e.target.checked)}
                        className="h-5 w-5 cursor-pointer accent-purple-700"
                        aria-label="Seleccionar todos los productos"
                      />
                    </span>
                    <span>
                      Seleccionar todo
                      <span className="ml-1 text-gray-400 dark:text-purple-100/50">
                        ({selectedItems.length} de {cart.length})
                      </span>
                    </span>
                  </label>
                )}

                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                      /*
                        La fila respira: `py-4` y `gap-4`. Antes era `py-0` y
                        `gap-2`, así que la foto tocaba la línea divisoria y el
                        nombre, el precio y los controles quedaban apretados
                        contra el borde derecho.
                      */
                      className={`flex items-center gap-4 border-b border-gray-200 py-4 last:border-b-0 dark:border-white/10 ${
                        isSelected(String(item.id)) ? "" : "opacity-50"
                      }`}
                    >
                      {/* Casilla: qué me llevo ahora y qué queda para después */}
                      <label className="-ml-2.5 grid h-11 w-11 shrink-0 cursor-pointer place-items-center">
                        <input
                          type="checkbox"
                          checked={isSelected(String(item.id))}
                          onChange={() => toggleSelected(String(item.id))}
                          className="h-5 w-5 cursor-pointer rounded accent-purple-700"
                          aria-label={`Comprar ahora ${item.name}`}
                        />
                      </label>

                      {/* Foto más chica: antes ocupaba 144px y le comía el ancho al texto */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-purple-50 sm:h-24 sm:w-24 dark:bg-white/5">
                        <Image
                          src={item.images && item.images.length > 0 ? item.images[0] : "/placeholder.jpg"}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="min-w-0">
                          {/* En el teléfono la columna es angosta y con
                              `truncate` los nombres largos quedaban cortados
                              ("Anillos con diseño se…"). Dos líneas entran sin
                              descolocar la fila. */}
                          <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 sm:text-base dark:text-purple-50">
                            {item.name}
                          </p>
                          {item.attributes && item.attributes.length > 0 && (
                            <p className="truncate text-xs text-gray-500 dark:text-purple-100/60">
                              {item.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                          <span className="text-base font-bold text-purple-800 dark:text-purple-200">
                            ${item.price.toFixed(2)}
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Cantidad, en un control compacto y redondeado */}
                            <div className="flex items-center rounded-full border border-purple-200 dark:border-white/15">
                              <button
                                onClick={() => handleDecrease(item.id)}
                                disabled={item.quantity <= 1}
                                aria-label="Quitar uno"
                                className="grid h-9 w-9 place-items-center rounded-l-full text-purple-800 transition hover:bg-purple-50 disabled:opacity-30 dark:text-purple-200 dark:hover:bg-white/10"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={item.stock}
                                value={item.quantity}
                                onChange={e => handleQuantityChange(item.id, Number(e.target.value))}
                                className="h-9 w-10 border-x border-purple-200 bg-transparent text-center text-sm dark:border-white/15"
                                disabled={item.stock === 0}
                                aria-label={`Cantidad de ${item.name}`}
                              />
                              <button
                                onClick={() => handleIncreaseWithStockCheck(item.id)}
                                disabled={item.quantity >= item.stock}
                                aria-label="Agregar uno"
                                className="grid h-9 w-9 place-items-center rounded-r-full text-purple-800 transition hover:bg-purple-50 disabled:opacity-30 dark:text-purple-200 dark:hover:bg-white/10"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="grid h-9 w-9 place-items-center rounded-full text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/15"
                              aria-label={`Eliminar ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {(item.quantity >= item.stock && item.stock > 0) && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Es todo lo que queda
                          </p>
                        )}
                        {stockMessages[item.id] && (
                          <p className="text-xs text-red-500">{stockMessages[item.id]}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="mt-6">
                  {/* Sin variante oscura, este botón quedaba con el hover en
                      morado claro sobre el fondo negro. */}
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-purple-200 px-6 text-purple-900 transition hover:bg-purple-50 dark:border-white/15 dark:text-purple-100 dark:hover:bg-white/10"
                  >
                    <Link href="/shop">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Seguir comprando
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="lg:w-1/3">
              {/* top-20 = 64px de barra + aire. Antes era top-24, calculado
                  sobre una barra que medía 72 y ya no. */}
              <div className="sticky top-20 rounded-3xl bg-card p-6 shadow-[0_2px_16px_rgba(24,10,48,0.10)] ring-1 ring-purple-100/70 dark:ring-purple-300/15">
                <h2 className="mb-5 text-xl font-semibold text-purple-900 dark:text-purple-100">
                  Resumen
                </h2>

                <div className="mb-6 space-y-3.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-gray-600 dark:text-purple-100/70">
                      Subtotal
                      <span className="ml-1 text-sm text-gray-400 dark:text-purple-100/50">
                        ({resumenCantidad})
                      </span>
                    </span>
                    <span className="font-medium text-gray-900 dark:text-purple-50">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        Cupón {codigoCupon}
                      </span>
                      <span className="font-medium">−${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex items-baseline justify-between">
                    <span className="text-gray-600 dark:text-purple-100/70">Envío</span>
                    <span className="text-sm text-gray-500 dark:text-purple-100/60">
                      Se calcula al pagar
                    </span>
                  </div>

                  {/* Cupón */}
                  <div className="pt-1">
                    {discount > 0 ? (
                      <button
                        onClick={quitarCupon}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 underline-offset-2 hover:underline dark:text-purple-100/60"
                      >
                        <X className="h-3 w-3" /> Quitar el cupón
                      </button>
                    ) : (
                      <>
                        <label
                          htmlFor="cupon"
                          className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-purple-100/70"
                        >
                          ¿Tienes un cupón?
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="cupon"
                            value={textoCupon}
                            onChange={(e) => {
                              setTextoCupon(e.target.value.toUpperCase())
                              setCuponError(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") comprobarCupon(textoCupon.trim(), true)
                            }}
                            placeholder="CÓDIGO"
                            className="h-10 min-w-0 flex-1 rounded-full border border-purple-200 bg-transparent px-4 text-sm uppercase tracking-wide text-gray-900 placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-400 focus:border-purple-400 focus:outline-none dark:border-white/15 dark:text-purple-50"
                          />
                          <Button
                            type="button"
                            onClick={() => comprobarCupon(textoCupon.trim(), true)}
                            disabled={!textoCupon.trim() || validandoCupon}
                            className="h-10 shrink-0 rounded-full bg-purple-100 px-5 text-sm font-semibold text-purple-900 shadow-none hover:bg-purple-200 dark:bg-white/10 dark:text-purple-50 dark:hover:bg-white/15"
                          >
                            {validandoCupon ? "..." : "Aplicar"}
                          </Button>
                        </div>
                        {cuponError && (
                          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{cuponError}</p>
                        )}
                      </>
                    )}
                  </div>

                  <Separator className="dark:bg-white/10" />

                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-gray-800 dark:text-purple-50">Total</span>
                    <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-purple-100/55">
                    El envío se suma en el paso siguiente, según a dónde va.
                  </p>
                </div>

                {/*
                  El botón dice cuántas unidades se van a cobrar y se apaga si
                  no hay nada marcado: sin esto se podía entrar al checkout con
                  el carrito lleno pero todo sin seleccionar, y quedaba una
                  pantalla de pago por $0.
                */}
                {selectedItems.length === 0 ? (
                  <Button disabled className="h-14 w-full rounded-full text-base">
                    Marca lo que quieres llevar
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="h-14 w-full rounded-full bg-purple-700 text-base font-semibold shadow-lg shadow-purple-900/20 transition hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500"
                  >
                    <Link href="/checkout">
                      Ir a pagar · ${total.toFixed(2)}
                    </Link>
                  </Button>
                )}

                {selectedItems.length < cart.length && selectedItems.length > 0 && (
                  <p className="mt-2.5 text-center text-xs text-gray-500 dark:text-purple-100/60">
                    {cart.length - selectedItems.length === 1
                      ? "El que no marcaste se queda en el carrito"
                      : `Los ${cart.length - selectedItems.length} sin marcar se quedan en el carrito`}
                  </p>
                )}

                {/* Lo que la clienta quiere saber antes de dar el último paso */}
                <ul className="mt-6 space-y-2.5 border-t border-purple-100 pt-5 dark:border-white/10">
                  <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-purple-100/70">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-purple-700 dark:text-purple-300" />
                    Pago seguro con PayPal
                  </li>
                  <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-purple-100/70">
                    <Truck className="h-4 w-4 shrink-0 text-purple-700 dark:text-purple-300" />
                    Envíos a todo Panamá
                  </li>
                  <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-purple-100/70">
                    <Heart className="h-4 w-4 shrink-0 text-purple-700 dark:text-purple-300" />
                    Tejido a mano, pieza por pieza
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <CartRecommendations excludeIds={cart.map(i => i.id)} />
        )}
      </div>

      {/*
        Barra fija de pago, solo en pantalla chica.

        En el teléfono el resumen queda DEBAJO de toda la lista de productos:
        con cinco piezas en el carrito hay que bajar media pantalla para
        encontrar el botón de pagar. Esta barra lo deja siempre a mano, con el
        total a la vista. En escritorio no aparece, porque ahí el resumen ya
        está fijo al costado.
      */}
      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-purple-100 bg-card/95 px-4 py-3 backdrop-blur-xl lg:hidden dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-purple-100/60">
                {resumenCantidad}
              </p>
              <p className="text-lg font-bold leading-tight text-purple-900 dark:text-purple-100">
                ${total.toFixed(2)}
              </p>
            </div>
            {selectedItems.length === 0 ? (
              <Button disabled className="h-12 flex-1 rounded-full text-sm">
                Marca lo que llevas
              </Button>
            ) : (
              <Button
                asChild
                className="h-12 flex-1 rounded-full bg-purple-700 text-sm font-semibold hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500"
              >
                <Link href="/checkout">Ir a pagar</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CartPage() {
  return (
    <CartContent />
  )
}
