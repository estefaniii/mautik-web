"use client"

import type React from "react"

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
import { products } from "@/data/products"
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
  const [suggestions, setSuggestions] = useState<typeof products>([])
  const [showCategories, setShowCategories] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)

  // Get all unique categories
  const categories = Array.from(new Set(products.map((product) => product.category)))

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.length > 0) {
      const filteredSuggestions = products
        .filter((product) =>
          product.name.toLowerCase().includes(value.toLowerCase()) ||
          product.description.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5)
      setSuggestions(filteredSuggestions)
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Scroll lock para menú mobile
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  // Cerrar menú de categorías al hacer click fuera
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

  // Reset selectedSuggestion cuando cambian las sugerencias
  useEffect(() => { setSelectedSuggestion(-1) }, [suggestions])

  // Cerrar menú móvil con Escape y devolver foco
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

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300
        ${isScrolled ? "bg-white/95 dark:bg-gray-900/95 shadow-lg py-2" : "bg-white/90 dark:bg-gray-900/90 py-4"}
        backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50
        md:py-2
      `}
      style={{ 
        boxShadow: isScrolled 
          ? '0 4px 24px 0 rgba(0,0,0,0.1), 0 1px 3px 0 rgba(0,0,0,0.05)' 
          : '0 1px 3px 0 rgba(0,0,0,0.05)',
        minHeight: isScrolled ? 56 : 72 
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
            <Link
              href="/"
              className={`text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded ${pathname === "/" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`}
            >
              Inicio
            </Link>
            <div className="relative">
              <button
                id="navbar-categories-button"
                onClick={() => setShowCategories(!showCategories)}
                className={`flex items-center text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded ${pathname === "/shop" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`}
                aria-haspopup="true"
                aria-expanded={showCategories}
                aria-label="Abrir menú de categorías"
              >
                Tienda
                {showCategories ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
              </button>
              {showCategories && (
                <div id="navbar-categories-menu" className="absolute left-0 mt-2 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-20 animate-fade-in">
                  <Link href="/shop" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200 rounded transition-colors">
                    Todos los Productos
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category}
                      href={`/shop?category=${category}`}
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200 rounded transition-colors"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/about"
              className={`text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded ${pathname === "/about" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`}
            >
              Nosotros
            </Link>
            <Link
              href="/contact"
              className={`text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded ${pathname === "/contact" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`}
            >
              Contacto
            </Link>
          </nav>

          {/* Search Bar (desktop & mobile) */}
          <div className="hidden md:block relative flex-grow max-w-[180px] md:max-w-[180px] lg:max-w-md mx-2 flex-shrink">
            <form onSubmit={handleSearchSubmit} autoComplete="off">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={handleSearchKeyDown}
                  aria-autocomplete="list"
                  aria-controls="search-suggestions-list"
                  aria-activedescendant={selectedSuggestion >= 0 ? `suggestion-${selectedSuggestion}` : undefined}
                  className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
                />
              </div>
            </form>
            {suggestions.length > 0 && (
              <div
                id="search-suggestions-list"
                role="listbox"
                className="absolute z-20 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl mt-1 shadow-xl max-h-60 overflow-auto animate-fade-in"
              >
                {suggestions.map((product, idx) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    id={`suggestion-${idx}`}
                    role="option"
                    aria-selected={selectedSuggestion === idx}
                    className={`flex items-center px-4 py-2 cursor-pointer rounded ${selectedSuggestion === idx ? 'bg-purple-50 dark:bg-purple-800/30' : 'hover:bg-purple-50 dark:hover:bg-purple-800/30'}`}
                    onClick={() => setSuggestions([])}
                    onMouseEnter={() => setSelectedSuggestion(idx)}
                  >
                    <div className="relative h-10 w-10 rounded-md overflow-hidden mr-3">
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{product.category}</span>
                    </div>
                  </Link>
                ))}
                <button
                  className="w-full text-left px-4 py-2 text-purple-800 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-800/30 border-t border-gray-100 dark:border-gray-800 text-sm font-medium"
                  onClick={() => {
                    setSuggestions([])
                    router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`)
                  }}
                  role="option"
                >
                  Ver todos los resultados para "{searchTerm}"
                </button>
              </div>
            )}
          </div>

          {/* User Actions (desktop) */}
          <div className="hidden md:flex items-center flex-shrink-0 space-x-2 md:space-x-3 lg:space-x-6 xl:space-x-8">
            {/* Simplified Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="relative group flex items-center justify-center"
              aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? (
                <Sun className="h-6 w-6 text-purple-800 dark:text-purple-300 transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-200" />
              ) : (
                <Moon className="h-6 w-6 text-purple-800 dark:text-purple-300 transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-200" />
              )}
            </button>
            
            <Link href="/favorites" className="relative group flex items-center justify-center" aria-label="Favoritos">
              <Heart className="h-6 w-6 text-purple-800 dark:text-purple-300 transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-200" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-800 dark:bg-purple-700 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">{favoritesCount}</span>
              )}
            </Link>
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative group flex items-center justify-center bg-transparent p-0 border-none shadow-none" aria-label="Carrito" style={{ width: 24, height: 24 }}>
                  <ShoppingCart className="h-6 w-6 text-purple-800 dark:text-purple-300 transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-200" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-800 dark:bg-purple-700 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">{cart.length}</span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl">
                <DropdownMenuLabel className="px-4 pt-4 pb-2 text-lg font-semibold text-purple-800 dark:text-purple-200">Tu Carrito</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                {cart.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">Tu carrito está vacío</div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                          <Image src={item.images[0] || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Cantidad: {item.quantity}</div>
                        </div>
                        <div className="font-semibold text-purple-800 dark:text-purple-200">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <div className="px-4 py-3 flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Subtotal</span>
                    <span className="text-lg font-bold text-purple-800 dark:text-purple-200">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/cart" className="flex-1">
                      <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">Ver Carrito</Button>
                    </Link>
                    <Link href="/checkout" className="flex-1">
                      <Button className="w-full bg-purple-800 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white">Checkout</Button>
                    </Link>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative group flex items-center justify-center bg-transparent p-0 border-none shadow-none" aria-label="Perfil" style={{ width: 24, height: 24 }}>
                    <Avatar>
                      <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.name || "Usuario"} />
                      <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">{getUserInitials(user.name || "U")}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl animate-fade-in">
                  <DropdownMenuLabel className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <UserIcon size={32} className="text-purple-800 dark:text-purple-300" />
                    {user.name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200">
                    <Link href="/profile" className="flex items-center gap-2">
                      <Settings size={16} /> Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200">
                    <Link href="/orders" className="flex items-center gap-2">
                      <Box size={16} /> Mis Pedidos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200">
                    <Link href="/admin" className="flex items-center gap-2">
                      <Settings size={16} /> Panel Admin
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 cursor-pointer">
                    <LogOut size={16} /> Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="relative group flex items-center justify-center" aria-label="Iniciar Sesión">
                <User className="h-6 w-6 text-purple-800 dark:text-purple-300 transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-200" />
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="flex md:hidden items-center gap-2">
            {/* Search icon (mobile) */}
            <button
              ref={mobileMenuButtonRef}
              className="p-3 rounded-full text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              style={{ minWidth: 44, minHeight: 44 }}
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Abrir menú móvil"
              aria-controls="mobile-menu-drawer"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="block md:hidden mt-3 mb-2 px-1">
          <form onSubmit={handleSearchSubmit} autoComplete="off">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyDown={handleSearchKeyDown}
                aria-autocomplete="list"
                aria-controls="search-suggestions-list"
                aria-activedescendant={selectedSuggestion >= 0 ? `suggestion-${selectedSuggestion}` : undefined}
                className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobileMenuOpen(false)} />
        )}
        <nav
          id="mobile-menu-drawer"
          className={`fixed top-0 left-0 w-4/5 max-w-xs h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl border-r border-gray-200/50 dark:border-gray-700/50 z-[100] transform transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? "translate-x-0 animate-slide-in" : "-translate-x-full"}
          `}
          aria-label="Menú móvil"
          role="navigation"
          tabIndex={-1}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <Link href="/" className="brand-name text-2xl font-bold bg-gradient-to-r from-purple-800 to-purple-800 dark:from-purple-300 dark:to-purple-300 bg-clip-text text-transparent transition-all duration-200 hover:from-purple-700 hover:to-purple-700 dark:hover:from-purple-200 dark:hover:to-purple-200 hover:scale-105 active:scale-95" onClick={() => setMobileMenuOpen(false)} aria-label="Ir a inicio">
              Mautik
            </Link>
            <button
              className="p-2 text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Cerrar menú móvil"
            >
              <X size={28} />
            </button>
          </div>
          <div className="flex flex-col gap-2 px-4 py-6">
            {/* Simplified Dark Mode Toggle for Mobile */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-3 py-3 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-purple-800 dark:text-purple-300" />
              ) : (
                <Moon className="h-5 w-5 text-purple-800 dark:text-purple-300" />
              )}
              <span className="text-gray-700 dark:text-gray-200 font-medium">
                {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
              </span>
            </button>
            
            <Link href="/" className="py-2 px-2 rounded text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900" onClick={() => setMobileMenuOpen(false)}>
              Inicio
            </Link>
            <div className="relative">
              <button
                id="navbar-categories-button"
                onClick={() => setShowCategories(!showCategories)}
                className={`flex items-center w-full text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200 py-2 px-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${pathname === "/shop" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`}
                aria-haspopup="true"
                aria-expanded={showCategories}
                aria-label="Abrir menú de categorías"
              >
                Tienda
                {showCategories ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
              </button>
              {showCategories && (
                <div className="ml-4 mt-2 space-y-2">
                  <Link href="/shop" className="block text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-200" onClick={() => setMobileMenuOpen(false)}>
                    Todos los Productos
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category}
                      href={`/shop?category=${category}`}
                      className="block text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
