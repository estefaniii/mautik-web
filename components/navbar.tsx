"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { coincide } from "@/lib/buscar"
import Link from "next/link"
import { Bell, ShoppingCart, User, Search, ChevronDown, ChevronUp, Menu, X, LogOut, Settings, User as UserIcon, Box, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { useTheme } from "@/context/theme-context"
import { useNotifications } from "@/context/notification-context"
import { CATEGORIAS } from "@/lib/categorias"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { NotificationBell } from "@/components/ui/notification-bell"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/*
  Sugerencias del buscador.

  Antes era una lista de nombres a secas, en las dos versiones (la del
  escritorio y la del menú del teléfono), con el mismo bloque de JSX copiado.
  Con la foto y el precio se reconoce la pieza sin tener que entrar a mirarla,
  que es justamente para lo que sirve un buscador con sugerencias.
*/
function ListaSugerencias({
  sugerencias,
  seleccion,
  alElegir,
  className = "",
}: {
  sugerencias: any[]
  seleccion: number
  alElegir: (id: string) => void
  className?: string
}) {
  if (sugerencias.length === 0) return null
  return (
    <div
      className={`absolute left-0 top-12 z-30 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-card ${className}`}
      role="listbox"
    >
      {sugerencias.map((producto, idx) => (
        <button
          key={producto.id}
          role="option"
          aria-selected={seleccion === idx}
          onClick={() => alElegir(producto.id)}
          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-purple-50 dark:hover:bg-white/5 ${
            seleccion === idx ? "bg-purple-50 dark:bg-white/10" : ""
          }`}
        >
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-purple-50 dark:bg-white/10">
            <Image
              src={producto.images?.[0] || "/placeholder.jpg"}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-gray-800 dark:text-purple-50">
              {producto.name}
            </span>
            <span className="block text-xs capitalize text-gray-500 dark:text-purple-100/60">
              {producto.category}
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-purple-800 dark:text-purple-200">
            ${Number(producto.price).toFixed(2)}
          </span>
        </button>
      ))}
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { cart } = useCart()
  const { user, logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  /*
    Reparto de la barra, pedido por Estéfani.

    Fuera, en la barra, solo lo que se usa a cada rato: el buscador y el
    carrito. La campana, el claro/oscuro y toda la cuenta se mudaron DENTRO
    del menú, porque estaban repetidos: el carrito y los accesos de la cuenta
    aparecían en la barra Y otra vez en el panel del menú.
  */
  const [buscadorMovil, setBuscadorMovil] = useState(false)
  const [tiendaAbierta, setTiendaAbierta] = useState(false)
  const [notisAbiertas, setNotisAbiertas] = useState(false)
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const cargandoCatalogo = useRef(false)

  /*
    El catálogo para las sugerencias se carga SOLO cuando alguien va a buscar.

    Antes se pedía en cada carga de página: los 68 productos, en la portada, en
    cada ficha, en el carrito… aunque nadie tocara el buscador. Eso es una
    consulta a la base por visita y por página, y en el plan gratis de Neon el
    cómputo se paga en horas de base despierta. Ahora se pide la primera vez
    que se escribe o se hace foco en el buscador, y se guarda para el resto de
    la sesión.
  */
  const cargarCatalogo = useCallback(async () => {
    if (allProducts.length > 0 || cargandoCatalogo.current) return
    cargandoCatalogo.current = true
    try {
      const response = await fetch('/api/products?limit=200')
      if (response.ok) setAllProducts(await response.json())
    } catch (error) {
      console.error('Error cargando el catálogo para el buscador:', error)
    } finally {
      cargandoCatalogo.current = false
    }
  }, [allProducts.length])

  /*
    Van a /shop/<categoría>, no a /shop?category=<categoría>.

    Las dos rutas existen y enseñan lo mismo, pero la del filtro es una sola
    URL para las ocho categorías: Google ve una página, no ocho. Las páginas
    por categoría ya estaban en el sitemap y hasta ahora ningún enlace del
    encabezado llevaba a ellas.
  */
  // Una sola fuente para las categorías (ver lib/categorias.ts): antes esta
  // lista, la del pie de página y la de la portada eran tres listas distintas
  // y el mismo enlace llevaba a sitios diferentes según dónde se tocara.
  const categories = [
    { name: "Todos los productos", href: "/shop" },
    ...CATEGORIAS.map((c) => ({ name: c.nombre, href: c.href })),
  ]


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    cargarCatalogo()
    setSearchTerm(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    if (value.length > 0) {
      // 1000 ms era eterno para un desplegable de sugerencias: se terminaba
      // de escribir antes de que apareciera nada. 220 ms se siente inmediato
      // y sigue evitando filtrar en cada tecla.
      const timeout = setTimeout(() => {
        const filteredSuggestions = allProducts
          .filter((product) => coincide(product, value))
          .slice(0, 6)
        setSuggestions(filteredSuggestions)
      }, 220)
      setSearchTimeout(timeout)
    } else {
      setSuggestions([])
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim().length > 0) {
      setSuggestions([])
      router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedSuggestion((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === "Enter") {
      if (selectedSuggestion >= 0 && selectedSuggestion < suggestions.length) {
        router.push(`/product/${suggestions[selectedSuggestion].id}`)
        setSuggestions([])
      }
    } else if (e.key === "Escape") {
      // Antes no había forma de cerrar el desplegable con el teclado: tapaba
      // la página hasta que se hacía clic en otro sitio.
      setSuggestions([])
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setBuscadorMovil(false)
  }, [pathname])

  // Los dos paneles del teléfono no pueden estar abiertos a la vez.
  useEffect(() => {
    if (mobileMenuOpen) setBuscadorMovil(false)
  }, [mobileMenuOpen])
  useEffect(() => {
    if (buscadorMovil) setMobileMenuOpen(false)
  }, [buscadorMovil])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!showCategories) return;
    function handleClickOutside(event: MouseEvent) {
      const menu = document.getElementById('navbar-categories-menu');
      const button = document.getElementById('navbar-categories-button');
      if (menu && !menu.contains(event.target as Node) && button && !button.contains(event.target as Node)) {
        setShowCategories(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategories]);

  useEffect(() => { setSelectedSuggestion(-1) }, [suggestions])

  useEffect(() => {
    if (!mobileMenuOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false)
        setTimeout(() => {
          mobileMenuButtonRef.current?.focus()
        }, 0)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mobileMenuOpen])

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout)
    }
  }, [searchTimeout])

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  /*
    El globito del carrito contaba LÍNEAS, no unidades: tres ositos iguales
    salían como "1". Ahora cuenta lo que hay dentro de verdad.
  */
  const unidadesCarrito = cart.reduce((n, item) => n + (item.quantity || 1), 0)

  // Determinar si el avatar es de Google
  const isGoogleAvatar = user?.avatar && user.avatar.includes('googleusercontent');
  // Usar src directo si es de Google, si no, agregar ?t=updatedAt para refrescar solo si es propio
  const avatarSrc = user?.avatar
    ? isGoogleAvatar
      ? user.avatar
      : user.avatar + (user.updatedAt ? `?t=${new Date(user.updatedAt).getTime()}` : '')
    : undefined;

    /*
      La barra mide SIEMPRE 64px.

      Antes cambiaba de alto al hacer scroll (72 arriba del todo, 56 más
      abajo) con un `minHeight` en línea. Eso, sumado a que abrir un menú
      bloquea el scroll del cuerpo, hacía que al tocar la campana de
      notificaciones el encabezado diera un salto y "se expandiera": el
      bloqueo movía el scroll, el detector de scroll se disparaba con 0 y la
      barra volvía al tamaño grande. Con una altura fija el problema no existe
      y además se ve más firme. Lo único que cambia al bajar es la sombra.
    */
  return (
    <>
    <header
      id="main-navigation"
      role="banner"
      className={`navbar-superficie fixed inset-x-0 top-0 z-50 h-16 w-full border-b border-gray-200/50 backdrop-blur-xl transition-shadow duration-300 dark:border-white/10 ${
        isScrolled ? "shadow-[0_4px_24px_rgba(24,10,48,0.12)]" : "shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      }`}
    >
      <div className="container mx-auto h-full px-4">
        <div className="flex h-full items-center justify-between gap-2 md:gap-3 lg:gap-8">
          {/* Logo */}
          {/*
            La marca, con el logo real de Mautik.

            Antes era solo la palabra "Mautik" en texto: la tienda no mostraba
            su propio logo en ninguna parte, ni siquiera en el encabezado. El
            archivo estaba en public/ pero solo se usaba para el favicon.

            Va el círculo + la palabra porque a 36px la tipografía de dentro
            del círculo no se alcanza a leer; juntos funcionan como firma.
          */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <Image
              src="/logo-marca.png"
              alt="Mautik"
              width={36}
              height={36}
              priority
              className="h-9 w-9 rounded-xl transition-transform group-hover:scale-105"
            />
            <span className="whitespace-nowrap text-xl font-bold text-purple-800 dark:text-purple-200">
              Mautik
            </span>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden shrink-0 items-center space-x-6 lg:flex lg:space-x-8 xl:space-x-12">
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className={`relative py-1 text-gray-700 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-purple-700 after:transition-transform after:duration-200 after:content-[''] hover:text-purple-800 focus:outline-none dark:text-purple-50 dark:after:bg-purple-300 dark:hover:text-purple-300 ${
                pathname === "/"
                  ? "font-semibold text-purple-800 after:scale-x-100 dark:text-purple-300"
                  : "after:scale-x-0 hover:after:scale-x-100"
              }`}
            >
              Inicio
            </Link>
            <div className="relative">
              <button
                id="navbar-categories-button"
                onClick={() => setShowCategories(!showCategories)}
                className={`flex items-center py-1 text-gray-700 transition-colors hover:text-purple-800 focus:outline-none dark:text-purple-50 dark:hover:text-purple-300 ${pathname?.startsWith("/shop") ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`}
                aria-haspopup="true"
                aria-expanded={showCategories}
                aria-label="Abrir menú de categorías"
              >
                Tienda
                {showCategories ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
              </button>
              {showCategories && (
                <div id="navbar-categories-menu" className="absolute left-0 mt-2 w-56 bg-white/95 dark:bg-background/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 dark:border-white/15 py-2 z-20 animate-fade-in">
                  {categories.map((cat) => (
                    <Link key={cat.name} href={cat.href} className="block px-4 py-2 text-gray-700 dark:text-purple-50 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200 rounded transition-colors">{cat.name}</Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/about"
              aria-current={pathname === "/about" ? "page" : undefined}
              className={`relative py-1 text-gray-700 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-purple-700 after:transition-transform after:duration-200 after:content-[''] hover:text-purple-800 focus:outline-none dark:text-purple-50 dark:after:bg-purple-300 dark:hover:text-purple-300 ${
                pathname === "/about"
                  ? "font-semibold text-purple-800 after:scale-x-100 dark:text-purple-300"
                  : "after:scale-x-0 hover:after:scale-x-100"
              }`}
            >
              Nosotros
            </Link>
            <Link
              href="/contact"
              aria-current={pathname === "/contact" ? "page" : undefined}
              className={`relative py-1 text-gray-700 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-purple-700 after:transition-transform after:duration-200 after:content-[''] hover:text-purple-800 focus:outline-none dark:text-purple-50 dark:after:bg-purple-300 dark:hover:text-purple-300 ${
                pathname === "/contact"
                  ? "font-semibold text-purple-800 after:scale-x-100 dark:text-purple-300"
                  : "after:scale-x-0 hover:after:scale-x-100"
              }`}
            >
              Contacto
            </Link>
          </nav>
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden min-w-0 flex-1 items-center lg:flex lg:max-w-[240px]">
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleSearchKeyDown}
              className="rounded-full pr-16"
              aria-label="Buscar productos"
            />
            {/* Vaciar: escribir algo y querer empezar de cero obligaba a borrar
                letra por letra. */}
            {searchTerm.length > 0 && (
              <button
                type="button"
                aria-label="Borrar la búsqueda"
                onClick={() => {
                  setSearchTerm("")
                  setSuggestions([])
                }}
                className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-purple-700 dark:hover:text-purple-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-purple-700 dark:hover:text-purple-300"
            >
              <Search className="h-5 w-5" />
            </button>
            <ListaSugerencias
              sugerencias={suggestions}
              seleccion={selectedSuggestion}
              alElegir={(id) => {
                router.push(`/product/${id}`)
                setSuggestions([])
                setSearchTerm("")
              }}
            />
          </form>
          {/* User actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-3 md:gap-4 lg:gap-4 xl:gap-5">
            {/* Carrito */}
            {/*
              Los cuatro iconos de la derecha tenían tratamientos distintos:
              la campana se redondeaba al pasar el ratón y el carrito, el tema
              y el avatar no. Ahora los cuatro son el mismo botón redondo de
              44px, que además es el área de toque mínima para el dedo.
            */}
            {/* Buscador del teléfono: abre una barra debajo del encabezado.
                Un campo de texto entero no cabe en la fila a 390px junto al
                logo, el carrito y la hamburguesa. */}
            <button
              onClick={() => setBuscadorMovil((v) => !v)}
              aria-label="Buscar productos"
              aria-expanded={buscadorMovil}
              className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-purple-50 focus:outline-none lg:hidden dark:hover:bg-white/10"
            >
              {buscadorMovil ? (
                <X className="h-[22px] w-[22px] text-purple-800 dark:text-purple-300" />
              ) : (
                <Search className="h-[22px] w-[22px] text-purple-800 dark:text-purple-300" />
              )}
            </button>
            <Link
              href="/cart"
              aria-label="Carrito"
              className="group relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-purple-50 dark:hover:bg-white/10"
            >
              <ShoppingCart className="h-[22px] w-[22px] text-purple-800 transition-colors group-hover:text-purple-700 dark:text-purple-300 dark:group-hover:text-purple-200" />
              {unidadesCarrito > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unidadesCarrito > 99 ? "99+" : unidadesCarrito}
                </Badge>
              )}
            </Link>
            {/* Notificaciones: en el teléfono van dentro del menú */}
            <span className="hidden lg:block">
              <NotificationBell />
            </span>
            {/* Modo oscuro: en el teléfono va dentro del menú */}
            <button
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="group hidden h-11 w-11 place-items-center rounded-full transition-colors hover:bg-purple-50 focus:outline-none lg:grid dark:hover:bg-white/10"
            >
              {isDarkMode ? (
                <Sun className="h-[22px] w-[22px] text-purple-800 dark:text-purple-300" />
              ) : (
                <Moon className="h-[22px] w-[22px] text-purple-800 dark:text-purple-300" />
              )}
            </button>
            {/* Usuario */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden items-center gap-2 rounded-full p-1 transition-colors hover:bg-purple-50 focus:outline-none lg:flex dark:hover:bg-white/10">
                    <Avatar className="h-8 w-8">
                      {user?.avatar ? (
                        <AvatarImage src={avatarSrc} alt={user?.name || "Usuario"} />
                      ) : (
                        <AvatarFallback>{getUserInitials(user?.name || "U")}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="hidden lg:inline text-gray-700 dark:text-purple-50 font-medium">{user.name?.split(" ")[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-purple-900/60 dark:text-purple-100/50">
                    Mi cuenta
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
                    <Link href="/profile" className="flex items-center gap-2.5">
                      <UserIcon className="h-4 w-4 text-purple-700 dark:text-purple-300" /> Perfil
                    </Link>
                  </DropdownMenuItem>

                  {/*
                    "Pedidos" es el historial de compras de la CLIENTA, no el
                    panel. A Estéfani le sobraba, porque ella gestiona los
                    pedidos desde /admin, pero a una clienta le hace falta: es
                    el único lugar donde ve lo que compró. Por eso se muestra
                    solo a quien no es administradora.
                  */}
                  {!user.isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
                      <Link href="/orders" className="flex items-center gap-2.5">
                        <Box className="h-4 w-4 text-purple-700 dark:text-purple-300" /> Mis pedidos
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/*
                    Antes el <DropdownMenuItem asChild> envolvía un condicional:
                    cuando no era admin, a `asChild` le llegaba `false` y
                    quedaba una fila vacía en el menú.
                  */}
                  {user.isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
                      <Link href="/admin" className="flex items-center gap-2.5">
                        <Settings className="h-4 w-4 text-purple-700 dark:text-purple-300" /> Panel de administración
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600"><LogOut className="h-6 w-6" /> Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /*
                En móvil solo va el icono. Con el texto "Iniciar sesión" el
                botón medía 142px y, sumado a los cuatro iconos, empujaba el
                botón de menú hamburguesa FUERA de la pantalla en 375px: en un
                teléfono no se podía abrir el menú. Verificado midiendo el DOM.
              */
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden px-3 lg:flex"
                aria-label="Iniciar sesión"
              >
                <Link href="/login" className="flex items-center">
                  <User className="mr-1 h-5 w-5 text-purple-800 dark:text-purple-300" />
                  <span>Iniciar sesión</span>
                </Link>
              </Button>
            )}
            {/* Menú móvil */}
            <button
              ref={mobileMenuButtonRef}
              className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-purple-50 focus:outline-none lg:hidden dark:hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú móvil"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-purple-800 dark:text-purple-300" />
              ) : (
                <Menu className="h-6 w-6 text-purple-800 dark:text-purple-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/*
        Barra de búsqueda del teléfono.

        Se despliega bajo el encabezado al tocar la lupa. Antes el buscador
        solo existía dentro del menú hamburguesa, o sea que para buscar algo
        había que abrir el menú primero.
      */}
      {buscadorMovil && (
        <div className="absolute inset-x-0 top-16 border-b border-gray-200/70 bg-card px-4 py-3 shadow-lg lg:hidden dark:border-white/10">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Input
              type="text"
              autoFocus
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleSearchKeyDown}
              className="rounded-full pr-16 text-base"
              aria-label="Buscar productos"
            />
            {searchTerm.length > 0 && (
              <button
                type="button"
                aria-label="Borrar la búsqueda"
                onClick={() => {
                  setSearchTerm("")
                  setSuggestions([])
                }}
                className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-purple-700 dark:hover:text-purple-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-purple-700 dark:hover:text-purple-300"
            >
              <Search className="h-5 w-5" />
            </button>
            <ListaSugerencias
              sugerencias={suggestions}
              seleccion={selectedSuggestion}
              className="max-h-72 overflow-y-auto"
              alElegir={(id) => {
                router.push(`/product/${id}`)
                setSuggestions([])
                setSearchTerm("")
                setBuscadorMovil(false)
              }}
            />
          </form>
        </div>
      )}

      {/* Menú móvil */}
    </header>

      {/*
      Menú del teléfono, rehecho.

      Lo de antes era una pila de enlaces grandes: la cuenta quedaba tan
      abajo que había que desplazar para llegar, las ocho categorías eran
      ocho filas más, y cada bloque tenía su propio tamaño de letra, así que
      se leía como tres menús pegados en vez de uno.

      Ahora sigue el orden que usa cualquier tienda: quién eres arriba, la
      navegación en filas de la misma altura, las categorías con su foto
      —son las de Estéfani— y abajo los ajustes.
    */}
    {mobileMenuOpen && (
      <div
        className="fixed inset-0 z-[60] h-[100dvh] w-screen bg-purple-950/45 backdrop-blur-[2px] dark:bg-black/65"
        onClick={() => setMobileMenuOpen(false)}
      >
        <nav
          /* Entra por la derecha, del lado donde está la hamburguesa: el
             dedo ya está ahí. */
          className="fixed right-0 top-0 z-[61] flex h-[100dvh] w-[88%] max-w-[380px] flex-col bg-card shadow-2xl animate-slide-in-right"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Cabecera ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-purple-100 px-4 py-3 dark:border-white/10">
            <Link
              href="/"
              className="flex items-center gap-2.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Image
                src="/logo-marca.png"
                alt="Mautik"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg"
              />
              <span className="text-lg font-bold text-purple-800 dark:text-purple-200">
                Mautik
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Cerrar menú"
              className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-purple-50 dark:hover:bg-white/10"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-purple-100" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* ── Quién eres ─────────────────────────────────────────── */}
            {user ? (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 border-b border-purple-100 px-4 py-4 transition-colors hover:bg-purple-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                <Avatar className="h-11 w-11">
                  {user?.avatar ? (
                    <AvatarImage src={avatarSrc} alt={user?.name || "Usuario"} />
                  ) : (
                    <AvatarFallback>{getUserInitials(user?.name || "U")}</AvatarFallback>
                  )}
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-gray-900 dark:text-purple-50">
                    {user.name}
                  </span>
                  <span className="block truncate text-xs text-gray-500 dark:text-purple-100/60">
                    Ver mi perfil
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 -rotate-90 text-gray-400" />
              </Link>
            ) : (
              <div className="border-b border-purple-100 px-4 py-4 dark:border-white/10">
                <p className="mb-3 text-sm text-gray-600 dark:text-purple-100/70">
                  Entra para ver tus pedidos y guardar tu dirección.
                </p>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-purple-700 font-semibold text-white transition hover:bg-purple-800"
                >
                  <User className="h-4 w-4" /> Iniciar sesión
                </Link>
              </div>
            )}

            {/* ── Navegación ─────────────────────────────────────────── */}
            <div className="py-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex h-12 items-center border-l-[3px] px-4 text-[15px] font-medium transition-colors ${
                  pathname === "/"
                    ? "border-purple-700 text-purple-800 dark:border-purple-400 dark:text-purple-200"
                    : "border-transparent text-gray-700 hover:bg-purple-50 dark:text-purple-50 dark:hover:bg-white/5"
                }`}
              >
                Inicio
              </Link>

              {/* Tienda, con las categorías colgando */}
              <button
                onClick={() => setTiendaAbierta((v) => !v)}
                aria-expanded={tiendaAbierta}
                className={`flex h-12 w-full items-center justify-between border-l-[3px] px-4 text-[15px] font-medium transition-colors ${
                  pathname.startsWith("/shop")
                    ? "border-purple-700 text-purple-800 dark:border-purple-400 dark:text-purple-200"
                    : "border-transparent text-gray-700 hover:bg-purple-50 dark:text-purple-50 dark:hover:bg-white/5"
                }`}
              >
                Tienda
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    tiendaAbierta ? "rotate-180" : ""
                  }`}
                />
              </button>

              {tiendaAbierta && (
                <div className="bg-purple-50/60 px-4 py-3 dark:bg-white/[0.03]">
                  {/* Si la última queda sola en su fila (son 7), ocupa el ancho entero:
                        una celda suelta a media fila deja la rejilla como rota. */}
                    <div className="grid grid-cols-2 gap-2 [&>*:last-child:nth-child(odd)]:col-span-2">
                    {CATEGORIAS.map((c) => (
                      <Link
                        key={c.slug}
                        href={c.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl bg-card p-2 ring-1 ring-purple-100 transition-colors hover:ring-purple-300 dark:ring-white/10 dark:hover:ring-white/25"
                      >
                        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={c.imagen}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0 truncate text-[13px] font-medium text-gray-800 dark:text-purple-50">
                          {c.nombre}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-purple-700 text-sm font-semibold text-white transition hover:bg-purple-800"
                  >
                    Ver todos los productos
                  </Link>
                </div>
              )}

              {[
                { href: "/about", texto: "Nosotros" },
                { href: "/contact", texto: "Contacto" },
              ].map((e) => (
                <Link
                  key={e.href}
                  href={e.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex h-12 items-center border-l-[3px] px-4 text-[15px] font-medium transition-colors ${
                    pathname === e.href
                      ? "border-purple-700 text-purple-800 dark:border-purple-400 dark:text-purple-200"
                      : "border-transparent text-gray-700 hover:bg-purple-50 dark:text-purple-50 dark:hover:bg-white/5"
                  }`}
                >
                  {e.texto}
                </Link>
              ))}
            </div>

            {/* ── Tu cuenta ──────────────────────────────────────────── */}
            {user && (
              <div className="border-t border-purple-100 py-2 dark:border-white/10">
                <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-purple-100/40">
                  Tu cuenta
                </p>
                {!user.isAdmin && (
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-12 items-center gap-3 px-4 text-[15px] text-gray-700 transition-colors hover:bg-purple-50 dark:text-purple-50 dark:hover:bg-white/5"
                  >
                    <Box className="h-[18px] w-[18px] text-purple-700 dark:text-purple-300" />
                    Mis pedidos
                  </Link>
                )}
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-12 items-center gap-3 px-4 text-[15px] text-gray-700 transition-colors hover:bg-purple-50 dark:text-purple-50 dark:hover:bg-white/5"
                  >
                    <Settings className="h-[18px] w-[18px] text-purple-700 dark:text-purple-300" />
                    Panel de administración
                  </Link>
                )}

                <button
                  onClick={() => setNotisAbiertas((v) => !v)}
                  aria-expanded={notisAbiertas}
                  className="flex h-12 w-full items-center gap-3 px-4 text-[15px] text-gray-700 transition-colors hover:bg-purple-50 dark:text-purple-50 dark:hover:bg-white/5"
                >
                  <Bell className="h-[18px] w-[18px] text-purple-700 dark:text-purple-300" />
                  Notificaciones
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-purple-700 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${
                      notisAbiertas ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {notisAbiertas && (
                  <div className="bg-purple-50/60 px-4 py-2 dark:bg-white/[0.03]">
                    {notifications.length === 0 ? (
                      <p className="py-2 text-sm text-gray-500 dark:text-purple-100/60">
                        No tienes notificaciones.
                      </p>
                    ) : (
                      <>
                        {notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            className="border-b border-purple-100/70 py-2 last:border-b-0 dark:border-white/10"
                          >
                            <p className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-purple-50">
                              {!n.isRead && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple-600" />
                              )}
                              {n.title}
                            </p>
                            <p className="line-clamp-2 text-xs text-gray-600 dark:text-purple-100/70">
                              {n.message}
                            </p>
                          </div>
                        ))}
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllAsRead()}
                            className="w-full py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300"
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Ajustes ────────────────────────────────────────────── */}
            <div className="border-t border-purple-100 py-2 dark:border-white/10">
              <div className="flex h-12 items-center gap-3 px-4">
                <span className="flex flex-1 items-center gap-3 text-[15px] text-gray-700 dark:text-purple-50">
                  {isDarkMode ? (
                    <Moon className="h-[18px] w-[18px] text-purple-700 dark:text-purple-300" />
                  ) : (
                    <Sun className="h-[18px] w-[18px] text-purple-700" />
                  )}
                  Modo oscuro
                </span>
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              </div>
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex h-12 w-full items-center gap-3 px-4 text-left text-[15px] text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  Cerrar sesión
                </button>
              )}
            </div>

            {/* ── Pie del menú ───────────────────────────────────────── */}
            <div className="border-t border-purple-100 px-4 py-4 dark:border-white/10">
              <p className="text-xs text-gray-500 dark:text-purple-100/55">
                Hecho a mano en La Chorrera, Panamá
              </p>
              <a
                href="https://www.instagram.com/mautik_official"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs font-medium text-purple-700 dark:text-purple-300"
              >
                @mautik_official
              </a>
            </div>
          </div>
        </nav>
      </div>
    )}
    </>
  );
}
