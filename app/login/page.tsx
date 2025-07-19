"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Head from "next/head"

// Component that handles search params
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register, isLoading, loginWithGoogle } = useAuth()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
  // Check for register parameter on mount
  useEffect(() => {
    const registerParam = searchParams.get("register")
    if (registerParam === "true") {
      setActiveTab("register")
    }
  }, [searchParams])
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  })
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos.",
        variant: "destructive"
      })
      return
    }

    const result = await login(loginForm.email, loginForm.password)
    if (result.success) {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente.",
      })
      // Enviar correo de bienvenida
      try {
        await fetch("/api/send-welcome-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginForm.email }),
        })
      } catch {}
      router.push("/")
    } else {
      setFormError(result.error || "Credenciales incorrectas.")
      toast({
        title: "Error de inicio de sesión",
        description: result.error || "Credenciales incorrectas.",
        variant: "destructive"
      })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos.",
        variant: "destructive"
      })
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Contraseñas no coinciden",
        description: "Las contraseñas deben ser iguales.",
        variant: "destructive"
      })
      return
    }

    if (registerForm.password.length < 6) {
    toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive"
      })
      return
    }

    const result = await register(registerForm.name, registerForm.email, registerForm.password)
    if (result.success) {
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente.",
      })
      // Enviar correo de bienvenida
      try {
        await fetch("/api/send-welcome-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: registerForm.email, name: registerForm.name }),
        })
      } catch {}
      router.push("/")
    } else {
      setFormError(result.error || "Error al crear la cuenta.")
      toast({
        title: "Error de registro",
        description: result.error || "Error al crear la cuenta.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <span className="text-3xl font-bold text-purple-900">Mautik</span>
          </Link>
          <p className="text-gray-600 mt-2">Accede a tu cuenta o crea una nueva</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Bienvenido</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
            {formError && (
              <div className="text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-center mt-4">
                {formError}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="pl-10"
                        required
                        disabled={isLoading}
                        aria-label="Correo electrónico"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                        disabled={isLoading}
                        aria-label="Contraseña"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-800 hover:bg-purple-900"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Iniciando sesión...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Iniciar Sesión</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">O continúa con</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    const result = await loginWithGoogle()
                    if (result.success) {
                      toast({
                        title: "¡Bienvenido!",
                        description: "Has iniciado sesión con Google exitosamente.",
                      })
                      router.push("/")
                    } else {
                      toast({
                        title: "Error de inicio de sesión",
                        description: result.error || "Error al conectar con Google.",
                        variant: "destructive"
                      })
                    }
                  }}
                  disabled={isLoading}
                >
                  {/* Google SVG icon */}
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.23-1.4 3.6-5.27 3.6-3.17 0-5.76-2.62-5.76-5.82s2.59-5.82 5.76-5.82c1.81 0 3.03.77 3.73 1.43l2.55-2.48C17.09 3.59 15.01 2.5 12.17 2.5c-3.7 0-6.84 2.13-8.28 5z"/>
                    <path fill="#34A853" d="M3.89 7.5l2.4 1.76c.65-1.23 2.01-2.7 5.88-2.7 1.81 0 3.03.77 3.73 1.43l2.55-2.48C17.09 3.59 15.01 2.5 12.17 2.5c-3.7 0-6.84 2.13-8.28 5l3.23 2.5c.4-.75 1.13-1.52 2.05-1.52.89 0 1.62.73 1.62 1.62 0 .89-.73 1.62-1.62 1.62-.92 0-1.65-.77-2.05-1.52l-3.23 2.5c1.44 2.87 4.58 5 8.28 5z"/>
                    <path fill="#FBBC05" d="M12.17 21.83c2.84 0 5.22-.94 6.96-2.56l-3.21-2.63c-.89.6-2.09.96-3.75.96-3.17 0-5.76-2.62-5.76-5.82 0-.91.23-1.77.63-2.52l-3.23-2.5C2.59 8.35 2.5 10.22 2.5 12.17c0 5.19 4.48 9.66 9.67 9.66z"/>
                    <path fill="#EA4335" d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.23-1.4 3.6-5.27 3.6-3.17 0-5.76-2.62-5.76-5.82s2.59-5.82 5.76-5.82c1.81 0 3.03.77 3.73 1.43l2.55-2.48C17.09 3.59 15.01 2.5 12.17 2.5c-3.7 0-6.84 2.13-8.28 5l3.23 2.5c.4-.75 1.13-1.52 2.05-1.52.89 0 1.62.73 1.62 1.62 0 .89-.73 1.62-1.62 1.62-.92 0-1.65-.77-2.05-1.52l-3.23 2.5c1.44 2.87 4.58 5 8.28 5z"/>
                  </svg>
                  Iniciar sesión con Google
                </Button>
                <div className="text-center text-sm text-gray-600 mt-4">
                  Al crear una cuenta, aceptas nuestros{" "}
                  <Link href="/terms-of-service" className="text-purple-600 hover:text-purple-700">
                    Términos de Servicio
                  </Link>{" "}
                  y{" "}
                  <Link href="/privacy-policy" className="text-purple-600 hover:text-purple-700">
                    Política de Privacidad
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombre completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="pl-10"
                        required
                        disabled={isLoading}
                        aria-label="Nombre completo"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="pl-10"
                        required
                        disabled={isLoading}
                        aria-label="Correo electrónico"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="register-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                        disabled={isLoading}
                        aria-label="Contraseña"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirmar contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="pl-10"
                        required
                        disabled={isLoading}
                        aria-label="Confirmar contraseña"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-800 hover:bg-purple-900"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creando cuenta...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Crear Cuenta</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">O continúa con</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    const result = await loginWithGoogle()
                    if (result.success) {
                      toast({
                        title: "¡Bienvenido!",
                        description: "Has iniciado sesión con Google exitosamente.",
                      })
                      router.push("/")
                    } else {
                      toast({
                        title: "Error de inicio de sesión",
                        description: result.error || "Error al conectar con Google.",
                        variant: "destructive"
                      })
                    }
                  }}
                  disabled={isLoading}
                >
                  {/* Google SVG icon */}
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.23-1.4 3.6-5.27 3.6-3.17 0-5.76-2.62-5.76-5.82s2.59-5.82 5.76-5.82c1.81 0 3.03.77 3.73 1.43l2.55-2.48C17.09 3.59 15.01 2.5 12.17 2.5c-3.7 0-6.84 2.13-8.28 5l3.23 2.5c.4-.75 1.13-1.52 2.05-1.52.89 0 1.62.73 1.62 1.62 0 .89-.73 1.62-1.62 1.62-.92 0-1.65-.77-2.05-1.52l-3.23 2.5c1.44 2.87 4.58 5 8.28 5z"/>
                    <path fill="#34A853" d="M3.89 7.5l2.4 1.76c.65-1.23 2.01-2.7 5.88-2.7 1.81 0 3.03.77 3.73 1.43l2.55-2.48C17.09 3.59 15.01 2.5 12.17 2.5c-3.7 0-6.84 2.13-8.28 5l3.23 2.5c.4-.75 1.13-1.52 2.05-1.52.89 0 1.62.73 1.62 1.62 0 .89-.73 1.62-1.62 1.62-.92 0-1.65-.77-2.05-1.52l-3.23 2.5c1.44 2.87 4.58 5 8.28 5z"/>
                    <path fill="#FBBC05" d="M12.17 21.83c2.84 0 5.22-.94 6.96-2.56l-3.21-2.63c-.89.6-2.09.96-3.75.96-3.17 0-5.76-2.62-5.76-5.82 0-.91.23-1.77.63-2.52l-3.23-2.5C2.59 8.35 2.5 10.22 2.5 12.17c0 5.19 4.48 9.66 9.67 9.66z"/>
                    <path fill="#EA4335" d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.23-1.4 3.6-5.27 3.6-3.17 0-5.76-2.62-5.76-5.82s2.59-5.82 5.76-5.82c1.81 0 3.03.77 3.73 1.43l2.55-2.48C17.09 3.59 15.01 2.5 12.17 2.5c-3.7 0-6.84 2.13-8.28 5l3.23 2.5c.4-.75 1.13-1.52 2.05-1.52.89 0 1.62.73 1.62 1.62 0 .89-.73 1.62-1.62 1.62-.92 0-1.65-.77-2.05-1.52l-3.23 2.5c1.44 2.87 4.58 5 8.28 5z"/>
                  </svg>
                  Registrarse con Google
                </Button>
                <div className="text-center text-sm text-gray-600 mt-4">
                  Al crear una cuenta, aceptas nuestros{" "}
                  <Link href="/terms-of-service" className="text-purple-600 hover:text-purple-700">
                    Términos de Servicio
                  </Link>{" "}
                  y{" "}
                  <Link href="/privacy-policy" className="text-purple-600 hover:text-purple-700">
                    Política de Privacidad
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Iniciar sesión o registrarse | Mautik</title>
        <meta name="description" content="Accede a tu cuenta o crea una nueva en Mautik. Compra productos únicos y gestiona tus pedidos fácilmente." />
      </Head>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </>
  )
}
