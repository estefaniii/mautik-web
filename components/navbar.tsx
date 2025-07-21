"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Heart, ShoppingCart, User, Search, ChevronDown, ChevronUp, Menu, X, LogOut, Settings, User as UserIcon, Box, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { useFavorites } from "@/context/favorites-context"
import { useTheme } from "@/context/theme-context"
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

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { cart } = useCart()
  const { user, logout } = useAuth()
  const { favoritesCount } = useFavorites()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const products = await response.json()
          setAllProducts(products)
        }
      } catch (error) {
        console.error('Error fetching products for search:', error)
      }
    }
    fetchProducts()
  }, [])

  const categories = [
    { name: "Todos los Productos", href: "/shop" },
    { name: "Crochet", href: "/shop?category=crochet" },
    { name: "Llaveros", href: "/shop?category=llaveros" },
    { name: "Pulseras", href: "/shop?category=pulseras" },
    { name: "Collares", href: "/shop?category=collares" },
    { name: "Anillos", href: "/shop?category=anillos" },
    { name: "Aretes", href: "/shop?category=aretes" },
    { name: "Otros", href: "/shop?category=otros" },
  ]

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    if (value.length > 0) {
      const timeout = setTimeout(() => {
        const filteredSuggestions = allProducts
          .filter((product) =>
            product.name.toLowerCase().includes(value.toLowerCase()) ||
            product.description.toLowerCase().includes(value.toLowerCase()) ||
            product.category.toLowerCase().includes(value.toLowerCase())
          )
          .slice(0, 5)
        setSuggestions(filteredSuggestions)
      }, 1000)
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
  }, [pathname])

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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const navbarHeight = isScrolled ? 56 : 72;

  // Determinar si el avatar es de Google
  const isGoogleAvatar = user?.avatar && user.avatar.includes('googleusercontent');
  // Usar src directo si es de Google, si no, agregar ?t=updatedAt para refrescar solo si es propio
  const avatarSrc = user?.avatar
    ? isGoogleAvatar
      ? user.avatar
      : user.avatar + (user.updatedAt ? `?t=${new Date(user.updatedAt).getTime()}` : '')
    : undefined;

  return (
    <header
      className={`w-full z-50 transition-all duration-300 ease-in-out will-change-transform fixed top-0 left-0 ${isScrolled ? "bg-white/95 dark:bg-gray-950/95 shadow-lg py-2" : "bg-white/90 dark:bg-gray-950/90 py-4"} backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 md:py-2`}
      style={{
        boxShadow: isScrolled
          ? '0 4px 24px 0 rgba(0,0,0,0.1), 0 1px 3px 0 rgba(0,0,0,0.05)'
          : '0 1px 3px 0 rgba(0,0,0,0.05)',
        minHeight: navbarHeight,
        left: 0,
        right: 0,
        transform: 'translateY(0)'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-2 md:gap-3 lg:gap-8 min-h-[56px]">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent dark:bg-none dark:text-purple-200">
              Mautik
            </span>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3 md:space-x-4 lg:space-x-10 xl:space-x-14">
            <Link href="/" className={`text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus:outline-none ${pathname === "/" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`}>Inicio</Link>
            <div className="relative">
              <button
                id="navbar-categories-button"
                onClick={() => setShowCategories(!showCategories)}
                className={`flex items-center text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus:outline-none ${pathname === "/shop" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`}
                aria-haspopup="true"
                aria-expanded={showCategories}
                aria-label="Abrir menú de categorías"
              >
                Tienda
                {showCategories ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
              </button>
              {showCategories && (
                <div id="navbar-categories-menu" className="absolute left-0 mt-2 w-56 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-600/50 py-2 z-20 animate-fade-in">
                  {categories.map((cat) => (
                    <Link key={cat.name} href={cat.href} className="block px-4 py-2 text-gray-700 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200 rounded transition-colors">{cat.name}</Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/about" className={`text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus:outline-none ${pathname === "/about" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`}>Nosotros</Link>
            <Link href="/contact" className={`text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus:outline-none ${pathname === "/contact" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`}>Contacto</Link>
          </nav>
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-64">
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleSearchKeyDown}
              className="pr-10"
              aria-label="Buscar productos"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-700 dark:hover:text-purple-300">
              <Search className="h-5 w-5" />
            </button>
            {suggestions.length > 0 && (
              <div className="absolute left-0 top-12 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30">
                {suggestions.map((product, idx) => (
                  <button
                    key={product.id}
                    className={`block w-full text-left px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-800/30 ${selectedSuggestion === idx ? "bg-purple-100 dark:bg-purple-900/40" : ""}`}
                    onClick={() => { router.push(`/product/${product.id}`); setSuggestions([]); }}
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            )}
          </form>
          {/* User actions */}
          <div className="flex items-center gap-3 md:gap-4 lg:gap-5 xl:gap-6">
            {/* Favoritos */}
            <Link href="/favorites" className="relative group">
              <Heart className="h-6 w-6 text-purple-800 dark:text-purple-300 group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors" />
              {favoritesCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow-none">{favoritesCount}</Badge>
              )}
            </Link>
            {/* Carrito */}
            <Link href="/cart" className="relative group">
              <ShoppingCart className="h-6 w-6 text-purple-800 dark:text-purple-300 group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">{cart.length}</Badge>
              )}
            </Link>
            {/* Notificaciones */}
            <span className="h-6 w-6 text-purple-800 dark:text-purple-300"><NotificationBell /></span>
            {/* Modo oscuro */}
            <button
              onClick={toggleDarkMode}
              aria-label="Cambiar modo de color"
              className="focus:outline-none"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isDarkMode ? (
                <Sun className="h-6 w-6 text-purple-800 dark:text-purple-300" />
              ) : (
                <Moon className="h-6 w-6 text-purple-800 dark:text-purple-300" />
              )}
            </button>
            {/* Usuario */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <Avatar className="h-8 w-8">
                      {user?.avatar ? (
                        <AvatarImage src={avatarSrc} alt={user?.name || "Usuario"} />
                      ) : (
                        <AvatarFallback>{getUserInitials(user?.name || "U")}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="hidden md:inline text-gray-700 dark:text-gray-200 font-medium">{user.name?.split(" ")[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2"><UserIcon className="h-6 w-6 text-purple-800 dark:text-purple-300" /> Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2"><Box className="h-6 w-6 text-purple-800 dark:text-purple-300" /> Pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    {user.isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2"><Settings className="h-6 w-6 text-purple-800 dark:text-purple-300" /> Admin</Link>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600"><LogOut className="h-6 w-6" /> Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/login"><User className="h-6 w-6 text-purple-800 dark:text-purple-300 mr-1" /> Iniciar sesión</Link>
              </Button>
            )}
            {/* Menú móvil */}
            <button
              ref={mobileMenuButtonRef}
              className="md:hidden flex items-center justify-center focus:outline-none"
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
      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60" onClick={() => setMobileMenuOpen(false)}>
          <nav
            className="fixed top-0 left-0 w-4/5 max-w-xs h-full min-h-screen bg-white dark:bg-black shadow-lg z-50 flex flex-col p-0 animate-slide-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Barra superior con logo, buscador y X */}
            <div className="flex flex-col gap-2 px-2 pt-3 pb-2 rounded-t-lg bg-white dark:bg-black">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2 group" onClick={() => setMobileMenuOpen(false)}>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent dark:bg-none dark:text-purple-200">Mautik</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú móvil">
                  <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </button>
              </div>
              {/* Buscador responsivo */}
              <form onSubmit={handleSearchSubmit} className="flex items-center w-full relative">
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={handleSearchKeyDown}
                  className="pr-10 text-base"
                  aria-label="Buscar productos"
                />
                <button type="submit" className="-ml-8 text-gray-400 hover:text-purple-700 dark:hover:text-purple-300">
                  <Search className="h-5 w-5" />
                </button>
                {suggestions.length > 0 && (
                  <div className="absolute left-0 top-12 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto">
                    {suggestions.map((product, idx) => (
                      <button
                        key={product.id}
                        className={`block w-full text-left px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-800/30 ${selectedSuggestion === idx ? "bg-purple-100 dark:bg-purple-900/40" : ""}`}
                        onClick={() => { router.push(`/product/${product.id}`); setSuggestions([]); }}
                      >
                        {product.name}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
            {/* Navegación móvil */}
            <div className="flex flex-col gap-1 px-2 py-4 bg-white dark:bg-black flex-1">
              <Link href="/" className="py-2 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 rounded" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
              <div className="relative">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center w-full py-2 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 rounded"
                  aria-haspopup="true"
                  aria-expanded={showCategories}
                  aria-label="Abrir menú de categorías"
                >
                  Tienda
                  {showCategories ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                </button>
                {showCategories && (
                  <div className="ml-4 mt-2 flex flex-col gap-1">
                    {categories.map((cat) => (
                      <Link key={cat.name} href={cat.href} className="block px-2 py-1 text-gray-700 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200 rounded transition-colors" onClick={() => setMobileMenuOpen(false)}>{cat.name}</Link>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/about" className="py-2 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 rounded" onClick={() => setMobileMenuOpen(false)}>Nosotros</Link>
              <Link href="/contact" className="py-2 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 rounded" onClick={() => setMobileMenuOpen(false)}>Contacto</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
