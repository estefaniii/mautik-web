"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { saveOrder } from "@/lib/utils"
import dynamic from "next/dynamic"
import AuthGuard from "@/components/auth-guard"
import AddressForm, { Address } from "@/components/address-form"
import { CreditCard, Home, MapPin, Plus, Edit, Star, Pencil, Trash2 } from "lucide-react"
import { DialogFooter } from "@/components/ui/dialog";
import PayPalButton from "@/components/paypal-button";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '@/components/payment-form';
import OrderSummarySticky from "@/components/order-summary-sticky"
import { getAvailableShippingMethods, calculateShipping, ShippingMethod } from '@/lib/shipping';

const CartRecommendations = dynamic(() => import("@/components/cart-recommendations"), { ssr: false })

function getCardIcon(brand: string) {
  switch ((brand || "").toLowerCase()) {
    case "visa": return <img src="/payment-visa.png" alt="Visa" className="h-6 inline" />;
    case "mastercard": return <img src="/payment-mastercard.png" alt="Mastercard" className="h-6 inline" />;
    case "paypal": return <img src="/payment-paypal.png" alt="Paypal" className="h-6 inline" />;
    default: return <CreditCard className="h-5 w-5 text-indigo-600 inline" />;
  }
}

export default function CheckoutPage() {
  const { cart, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Panamá"
    },
    payment: "card"
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCardForm, setNewCardForm] = useState({
    brand: "Visa",
    last4: "",
    expMonth: "",
    expYear: "",
    isDefault: false,
  });
  const [savingCard, setSavingCard] = useState(false);
  const [newCardError, setNewCardError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ brand: "Visa", last4: "", expMonth: "", expYear: "", isDefault: false });
  const [savingEdit, setSavingEdit] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: "",
    name: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    isDefault: false,
  });
  const [cardBrand, setCardBrand] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [showStripeSuccess, setShowStripeSuccess] = useState<null | { paymentId: string, email?: string }>(null);
  const [stockMessages, setStockMessages] = useState<{ [id: string]: string }>({})
  const prevStocks = useRef<{ [id: string]: number }>({})
  // 1. Add state for editing address
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  // Add state for real-time validation
  const [personalErrors, setPersonalErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [personalTouched, setPersonalTouched] = useState<{ name?: boolean; email?: boolean; phone?: boolean }>({});
  // Add state for real-time validation of new card form
  const [cardTouched, setCardTouched] = useState<Record<string, boolean>>({});
  // 1. Estado para edición inline de direcciones
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddressForm, setEditAddressForm] = useState<any>(null);

  // 2. Función para iniciar edición inline
  const startEditAddress = (address: any) => {
    setEditingAddressId(address.id);
    setEditAddressForm({ ...address });
  };

  // 3. Función para cancelar edición
  const cancelEditAddress = () => {
    setEditingAddressId(null);
    setEditAddressForm(null);
  };

  // 4. Función para guardar edición inline
  const saveEditAddress = async () => {
    setAddressLoading(true);
    setAddressError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
      const res = await fetch(`/api/addresses/${editingAddressId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editAddressForm),
      });
      if (!res.ok) throw new Error("Error al editar dirección");
      const updated = await res.json();
      setAddresses((prev: any[]) => prev.map(a => a.id === updated.id ? updated : a));
      setEditingAddressId(null);
      setEditAddressForm(null);
      toast && toast({ title: "Dirección actualizada", description: "La dirección fue actualizada correctamente.", variant: "default" });
    } catch (err: any) {
      const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
      setAddressError(errorToUse.message || "Error desconocido");
      toast && toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
    } finally {
      setAddressLoading(false);
    }
  };

  // 1. Estado para edición inline de métodos de pago
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editPaymentForm, setEditPaymentForm] = useState<any>(null);

  // 2. Función para iniciar edición inline
  const startEditPayment = (m: any) => {
    setEditingPaymentId(m.id);
    setEditPaymentForm({ ...m });
  };

  // 3. Función para cancelar edición
  const cancelEditPayment = () => {
    setEditingPaymentId(null);
    setEditPaymentForm(null);
  };

  // 4. Función para guardar edición inline
  const saveEditPayment = async () => {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/payment-methods/${editingPaymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editPaymentForm),
      });
      if (!res.ok) throw new Error("Error al editar método de pago");
      const updated = await res.json();
      setPaymentMethods((prev: any[]) => prev.map(m => m.id === updated.id ? updated : m));
      setEditingPaymentId(null);
      setEditPaymentForm(null);
      toast && toast({ title: "Método actualizado", description: "El método de pago fue actualizado correctamente.", variant: "default" });
    } catch (err: any) {
      toast && toast({ title: "Error", description: err?.message || "Error desconocido", variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };

  const validatePersonal = (field: string, value: string) => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'El nombre es obligatorio';
        break;
      case 'email':
        if (!value.trim()) return 'El email es obligatorio';
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Email inválido';
        break;
      case 'phone':
        if (!value.trim()) return 'El teléfono es obligatorio';
        if (!/^\+?\d{7,15}$/.test(value.replace(/\s/g, ""))) return 'Teléfono inválido';
        break;
    }
    return '';
  };

  const handlePersonalBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalTouched(prev => ({ ...prev, [name]: true }));
    const error = validatePersonal(name, value);
    setPersonalErrors(prev => ({ ...prev, [name]: error }));
  };

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    const { name, value } = e.target;
    if (personalTouched[name as keyof typeof personalTouched]) {
      const error = validatePersonal(name, value);
      setPersonalErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Validación Luhn
  function isValidCardNumber(number: string) {
    const n = number.replace(/\D/g, "");
    let sum = 0, shouldDouble = false;
    for (let i = n.length - 1; i >= 0; i--) {
      let digit = parseInt(n.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  // Nueva función para detectar marca de tarjeta
  function detectCardBrand(number: string) {
    const n = number.replace(/\D/g, "");
    if (/^4/.test(n)) return "Visa";
    if (/^5[1-5]/.test(n)) return "Mastercard";
    return "";
  }

  // Manejar cambios en el formulario de tarjeta
  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCardForm(f => ({ ...f, [name]: value }));
    if (name === "number") {
      setCardBrand(detectCardBrand(value));
    }
    setCardErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  // Validar y guardar nueva tarjeta
  const handleAddNewCardModern = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const n = cardForm.number.replace(/\D/g, "");
    if (!n || n.length < 16 || !isValidCardNumber(n)) errors.number = "Número inválido";
    if (!cardBrand || !["Visa", "Mastercard"].includes(cardBrand)) errors.number = "Solo Visa o Mastercard";
    if (!cardForm.name.trim()) errors.name = "Nombre requerido";
    if (!cardForm.expMonth.match(/^\d{2}$/) || +cardForm.expMonth < 1 || +cardForm.expMonth > 12) errors.expMonth = "Mes inválido";
    if (!cardForm.expYear.match(/^\d{2}$/)) errors.expYear = "Año inválido (2 dígitos)";
    if (!cardForm.cvv.match(/^\d{3}$/)) errors.cvv = "CVV inválido";
    setCardErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSavingCard(true);
    try {
      const res = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "card",
          brand: cardBrand,
          last4: n.slice(-4),
          expMonth: +cardForm.expMonth,
          expYear: +cardForm.expYear,
          isDefault: cardForm.isDefault,
          name: cardForm.name,
        })
      });
      if (!res.ok) throw new Error("Error al guardar tarjeta");
      const data = await res.json();
      setPaymentMethods((prev: any[]) => [...prev, data]);
      setSelectedPaymentId(data.id);
      setShowNewCard(false);
      setCardForm({ number: "", name: "", expMonth: "", expYear: "", cvv: "", isDefault: false });
      setCardBrand("");
      toast({ title: "Tarjeta guardada", description: "Tarjeta agregada correctamente.", variant: "default" });
    } catch (err: any) {
      const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
      toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
    } finally {
      setSavingCard(false);
    }
  };

  // Cargar datos del usuario autenticado al inicializar
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || "Panamá"
        },
        payment: "card"
      })
    }
  }, [user])

  // Enfocar el primer campo editable al cargar
  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, []);

  // Obtener direcciones guardadas
  useEffect(() => {
    async function fetchAddresses() {
      if (!user) return;
      setAddressLoading(true);
      setAddressError(null);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
        const res = await fetch("/api/addresses", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Error al cargar direcciones");
        const data = await res.json();
        setAddresses(data);
        // Seleccionar la predeterminada
        const def = data.find((a: any) => a.isDefault) || data[0];
        if (def) setSelectedAddressId(def.id);
      } catch (err: any) {
        const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
        setAddressError(errorToUse.message || "Error desconocido");
      } finally {
        setAddressLoading(false);
      }
    }
    fetchAddresses();
  }, [user]);

  // Cargar métodos de pago guardados
  useEffect(() => {
    async function fetchMethods() {
      if (!user) return;
      try {
        const res = await fetch("/api/payment-methods");
        if (!res.ok) return;
        const data = await res.json();
        setPaymentMethods(data);
        // Seleccionar default automáticamente
        const def = data.find((m: any) => m.isDefault) || data[0];
        if (def) {
          setSelectedPaymentId(def.id);
          setForm(f => ({ ...f, payment: def.id }));
        }
      } catch {}
    }
    fetchMethods();
  }, [user]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  // Estado para método de envío
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);

  // Cuando cambia la dirección seleccionada, actualizar métodos y método de envío
  useEffect(() => {
    if (selectedAddressId) {
      const selected = addresses.find((a: any) => a.id === selectedAddressId);
      const available = getAvailableShippingMethods(selected);
      setShippingMethod((available[0] as ShippingMethod) || null);
    } else {
      setShippingMethod(null);
    }
  }, [selectedAddressId, addresses]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  // Calcular costo de envío dinámicamente
  const shippingCost = shippingMethod && selectedAddressId
    ? calculateShipping(addresses.find((a: any) => a.id === selectedAddressId), cart, shippingMethod)
    : 0;
  const total = subtotal + shippingCost;

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || 
        !form.address.street.trim() || !form.address.city.trim() || 
        !form.address.state.trim() || !form.address.zipCode.trim() || 
        !form.address.country.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos.",
        variant: "destructive"
      })
      return false
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido.",
        variant: "destructive"
      })
      return false
    }
    if (!/^\+?\d{7,15}$/.test(form.phone.replace(/\s/g, ""))) {
      toast({
        title: "Teléfono inválido",
        description: "Por favor ingresa un teléfono válido.",
        variant: "destructive"
      })
      return false
    }
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAddressChange = (address: Address) => {
    setForm({ ...form, address })
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === "paymentMethodRadio") {
      setSelectedPaymentId(e.target.value);
      setShowNewCard(false);
      setForm(f => ({ ...f, payment: e.target.value }));
    } else if (e.target.name === "payment") {
      setForm({ ...form, payment: e.target.value });
      if (e.target.value === "new") {
        setShowNewCard(true);
        setSelectedPaymentId(null);
      } else {
        setShowNewCard(false);
      }
    } else {
      handleChange(e);
    }
  };

  const handleNewCardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewCardForm({ ...newCardForm, [e.target.name]: e.target.value });
  };

  const handleAddNewCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewCardError(null);
    // Validación básica
    if (!newCardForm.last4.match(/^\d{4}$/)) {
      setNewCardError("Los últimos 4 dígitos deben ser 4 números");
      return;
    }
    if (!newCardForm.expMonth.match(/^\d{1,2}$/) || +newCardForm.expMonth < 1 || +newCardForm.expMonth > 12) {
      setNewCardError("Mes inválido");
      return;
    }
    if (!newCardForm.expYear.match(/^\d{2,4}$/)) {
      setNewCardError("Año inválido");
      return;
    }
    setSavingCard(true);
    try {
      const res = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "card",
          brand: newCardForm.brand,
          last4: newCardForm.last4,
          expMonth: +newCardForm.expMonth,
          expYear: +newCardForm.expYear,
          isDefault: false,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar la tarjeta");
      const data = await res.json();
      setPaymentMethods((prev: any[]) => [...prev, data]);
      setSelectedPaymentId(data.id);
      setForm(f => ({ ...f, payment: data.id }));
      setShowNewCard(false);
      setNewCardForm({ brand: "Visa", last4: "", expMonth: "", expYear: "", isDefault: false });
    } catch (err: any) {
      const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
      setNewCardError(errorToUse.message || "Error desconocido");
    } finally {
      setSavingCard(false);
    }
  };

  // Nueva función para agregar dirección desde el checkout
  const handleSaveNewAddress = async (address: Address) => {
    setAddressLoading(true);
    setAddressError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          alias: "Checkout",
          recipientName: form.name,
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
          phone: form.phone,
          isDefault: addresses.length === 0,
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al guardar dirección");
      }
      const data = await res.json();
      setAddresses((prev: any[]) => [...prev, data]);
      setSelectedAddressId(data.id);
      setShowNewAddress(false);
      toast({ title: "Dirección guardada", description: "La dirección fue guardada correctamente.", variant: "default" });
    } catch (err: any) {
      const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
      setAddressError(errorToUse.message || "Error desconocido");
      toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
    } finally {
      setAddressLoading(false);
    }
  };

  // 1. Eliminar dirección desde el checkout
  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta dirección?")) return;
    setAddressLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
      const res = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Error al eliminar dirección");
      const updated = addresses.filter((a: any) => a.id !== id);
      setAddresses(updated);
      toast({ title: "Dirección eliminada", description: "La dirección fue eliminada correctamente.", variant: "default" });
      // Si la dirección eliminada era la seleccionada, seleccionar otra
      if (selectedAddressId === id && updated.length > 0) {
        setSelectedAddressId(updated[0].id);
      } else if (updated.length === 0) {
        setSelectedAddressId(null);
      }
    } catch (err: any) {
      const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
      toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
    } finally {
      setAddressLoading(false);
    }
  };

  // Polling para actualizar stock de todos los productos cada 20s
  useEffect(() => {
    const interval = setInterval(async () => {
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
          const item = cart.find(i => i.id === id)
          if (item && item.quantity > updates[id]) {
            updateQuantity(id, updates[id])
          }
        }
      }
    }, 20000)
    return () => clearInterval(interval)
  }, [cart])

  // Validar stock antes de enviar el pedido
  const fetchLatestStocks = async () => {
    let ok = true
    for (const item of cart) {
      const res = await fetch(`/api/products/${item.id}`)
      if (res.ok) {
        const data = await res.json()
        if (typeof data.stock === 'number') {
          if (data.stock !== item.stock) {
            if (data.stock < item.quantity) {
              updateQuantity(item.id, data.stock)
              setStockMessages(msgs => ({ ...msgs, [item.id]: 'El stock ha cambiado, ajustamos tu carrito.' }))
              ok = false
            }
          }
        }
      }
    }
    return ok
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validar stock antes de continuar
    const ok = await fetchLatestStocks()
    if (!ok) {
      toast({
        title: "Stock insuficiente",
        description: `Algunos productos han cambiado de stock. Ajusta tu carrito antes de continuar.`,
        variant: "destructive"
      })
      return;
    }
    if (!selectedAddressId) {
      toast({ title: "Selecciona una dirección", description: "Debes seleccionar una dirección de envío.", variant: "destructive" });
      return;
    }
    if (!selectedPaymentId) {
      toast({ title: "Selecciona un método de pago", description: "Debes seleccionar un método de pago.", variant: "destructive" });
      return;
    }
    // Buscar la dirección seleccionada
    const shippingAddress = addresses.find((a: any) => a.id === selectedAddressId);
    if (!shippingAddress) {
      toast({ title: "Error", description: "Dirección seleccionada no encontrada.", variant: "destructive" });
      return;
    }
    if (!validate()) return
    setLoading(true)
    try {
      // Preparar los datos del pedido
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        address: shippingAddress, // Usar la dirección seleccionada
        name: form.name,
        email: form.email,
        phone: form.phone,
        payment: selectedPaymentId || form.payment,
        totalAmount: total,
      }
      // Hacer POST al backend
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })
      if (!res.ok) {
        const error = await res.json()
        toast({
          title: "Error al registrar el pedido",
          description: error.message || "Intenta de nuevo más tarde.",
          variant: "destructive"
        })
        setLoading(false)
        return
      }
      setLoading(false)
      setSubmitted(true)
    clearCart()
      toast({
        title: "¡Pedido realizado!",
        description: "Tu pedido ha sido registrado exitosamente.",
      })
      setTimeout(() => {
        router.push("/orders")
      }, 2000)
    } catch (err) {
      setLoading(false)
      toast({
        title: "Error de red",
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
        variant: "destructive"
      })
    }
  }

  // Editar método de pago
  const handleEditPayment = (m: any) => {
    setEditForm({
      brand: m.brand || "Visa",
      last4: m.last4 || "",
      expMonth: m.expMonth ? String(m.expMonth) : "",
      expYear: m.expYear ? String(m.expYear) : "",
      isDefault: !!m.isDefault,
    });
    setEditingPayment(m);
  };
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/payment-methods/${editingPayment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "card",
          brand: editForm.brand,
          last4: editForm.last4,
          expMonth: +editForm.expMonth,
          expYear: +editForm.expYear,
          isDefault: editForm.isDefault,
        }),
      });
      if (!res.ok) throw new Error("Error al editar método de pago");
      toast({ title: "Método actualizado", description: "La tarjeta fue actualizada.", variant: "default" });
      setEditingPayment(null);
      // Refrescar métodos
      const data = await fetch("/api/payment-methods").then(r => r.json());
      setPaymentMethods(data);
    } catch (err: any) {
      const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
      toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };
  // Eliminar método de pago
  const handleDeletePayment = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tarjeta?")) return;
    setDeletingPaymentId(id);
    try {
      const res = await fetch(`/api/payment-methods/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar método de pago");
      toast({ title: "Tarjeta eliminada", description: "La tarjeta fue eliminada.", variant: "default" });
      // Refrescar métodos
      const data = await fetch("/api/payment-methods").then(r => r.json());
      setPaymentMethods(data);
      // Si el método eliminado era el seleccionado, seleccionar otro
      if (selectedPaymentId === id && data.length > 0) {
        setSelectedPaymentId(data[0].id);
      } else if (data.length === 0) {
        setSelectedPaymentId(null);
      }
    } catch (err: any) {
      const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
      toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
    } finally {
      setDeletingPaymentId(null);
    }
  };

  // Add state for real-time validation of new card form
  const validateCardField = (field: string, value: string) => {
    switch (field) {
      case 'number': {
        const n = value.replace(/\D/g, "");
        if (!n || n.length < 16 || !isValidCardNumber(n)) return 'Número inválido';
        if (!detectCardBrand(value) || !["Visa", "Mastercard"].includes(detectCardBrand(value))) return 'Solo Visa o Mastercard';
        break;
      }
      case 'name':
        if (!value.trim()) return 'Nombre requerido';
        break;
      case 'expMonth':
        if (!value.match(/^\d{2}$/) || +value < 1 || +value > 12) return 'Mes inválido';
        break;
      case 'expYear':
        if (!value.match(/^\d{2}$/)) return 'Año inválido (2 dígitos)';
        break;
      case 'cvv':
        if (!value.match(/^\d{3}$/)) return 'CVV inválido';
        break;
    }
    return '';
  };

  const handleCardBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCardTouched(prev => ({ ...prev, [name]: true }));
    const error = validateCardField(name, value);
    setCardErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleCardInputRealtime = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleCardInput(e);
    const { name, value } = e.target;
    if (cardTouched[name]) {
      const error = validateCardField(name, value);
      setCardErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // 1. Constantes para la clave de localStorage
  const CHECKOUT_PROGRESS_KEY = "checkout-progress-v1"

  // 2. Al cargar el componente, restaurar progreso si existe
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(CHECKOUT_PROGRESS_KEY) : null
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setForm(f => ({ ...f, ...parsed.form }))
        if (parsed.selectedAddressId) setSelectedAddressId(parsed.selectedAddressId)
        if (parsed.selectedPaymentId) setSelectedPaymentId(parsed.selectedPaymentId)
        // Feedback visual sutil (opcional):
        toast && toast({ title: "Progreso restaurado", description: "Se restauraron los datos del checkout." })
      } catch {}
    }
  }, [])

  // 3. Guardar automáticamente en localStorage al cambiar datos relevantes
  useEffect(() => {
    if (typeof window === "undefined") return
    const data = {
      form,
      selectedAddressId,
      selectedPaymentId
    }
    localStorage.setItem(CHECKOUT_PROGRESS_KEY, JSON.stringify(data))
  }, [form, selectedAddressId, selectedPaymentId])

  // 4. Limpiar progreso al finalizar el pedido exitosamente
  useEffect(() => {
    if (submitted && typeof window !== "undefined") {
      localStorage.removeItem(CHECKOUT_PROGRESS_KEY)
    }
  }, [submitted])

  // Al inicio del componente CheckoutPage:
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-purple-800">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega productos a tu carrito para continuar con el checkout.</p>
            <Link href="/shop">
            <Button className="bg-indigo-600 hover:bg-indigo-700">Volver a la tienda</Button>
            </Link>
          </div>
        </div>
    );
  }

  if (submitted) {
    // Buscar datos del pedido para el resumen
    const shippingAddress = addresses.find((a: any) => a.id === selectedAddressId);
    const paymentMethod = paymentMethods.find((m: any) => m.id === selectedPaymentId);
    return (
      <AuthGuard>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center border border-indigo-100">
            <h2 className="text-3xl font-extrabold text-purple-900 mb-2">¡Gracias por tu compra!</h2>
            <p className="text-gray-700 mb-6">Tu pedido ha sido registrado exitosamente.<br />Pronto recibirás un correo con los detalles.</p>
            <div className="mb-6 text-left">
              <h3 className="text-lg font-bold text-indigo-800 mb-2">Resumen del pedido</h3>
              <ul className="divide-y divide-indigo-100 mb-2">
                {cart.map(item => (
                  <li key={item.id} className="py-2 flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.name} <span className="text-xs text-gray-500">x{item.quantity}</span></span>
                    <span className="text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Envío</span>
                <span className="text-gray-900 font-medium">${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {shippingAddress && (
                <div className="mt-4 p-3 rounded bg-indigo-50 border border-indigo-100">
                  <div className="font-semibold text-indigo-800 mb-1">Enviado a:</div>
                  <div className="text-sm text-gray-700">{shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state}, {shippingAddress.zipCode}, {shippingAddress.country}</div>
                  <div className="text-xs text-gray-500">Tel: {shippingAddress.phone}</div>
                </div>
              )}
              {paymentMethod && (
                <div className="mt-2 p-3 rounded bg-indigo-50 border border-indigo-100 flex items-center gap-2">
                  <span className="font-semibold text-indigo-800">Pago:</span>
                  <span className="text-gray-900">{paymentMethod.brand} •••• {paymentMethod.last4}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button asChild className="bg-purple-800 hover:bg-purple-900 w-full sm:w-auto">
                <Link href="/orders">Ver mis pedidos</Link>
              </Button>
              <Button asChild variant="outline" className="border-indigo-400 text-indigo-700 w-full sm:w-auto">
                <Link href="/shop">Seguir comprando</Link>
              </Button>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  // Filtrar métodos de pago permitidos
  const allowedBrands = ["visa", "mastercard", "paypal"];
  const filteredPaymentMethods = paymentMethods.filter(m => allowedBrands.includes((m.brand || m.type || "").toLowerCase()));

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

  // 1. Estado para campos tocados y errores de dirección
  const [addressErrors, setAddressErrors] = useState<any>({});
  const [addressTouched, setAddressTouched] = useState<any>({});

  // 2. Función de validación de dirección
  const validateAddressField = (field: string, value: string) => {
    if (!value.trim()) return 'Este campo es obligatorio';
    if (field === 'zipCode' && !/^\d{4,10}$/.test(value)) return 'Código postal inválido';
    if (field === 'phone' && !/^\+?\d{7,15}$/.test(value.replace(/\s/g, ""))) return 'Teléfono inválido';
    return '';
  };

  // 3. Handlers para blur y change de dirección
  const handleAddressInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressTouched((prev: any) => ({ ...prev, [name]: true }));
    const error = validateAddressField(name, value);
    setAddressErrors((prev: any) => ({ ...prev, [name]: error }));
  };
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAddressChange({ ...form.address, [e.target.name]: e.target.value });
    if (addressTouched[e.target.name]) {
      const error = validateAddressField(e.target.name, e.target.value);
      setAddressErrors((prev: any) => ({ ...prev, [e.target.name]: error }));
    }
  };

  // 1. Estado para campos tocados y errores de método de pago
  const [paymentErrors, setPaymentErrors] = useState<any>({});
  const [paymentTouched, setPaymentTouched] = useState<any>({});

  // 2. Función de validación de método de pago
  const validatePaymentField = (field: string, value: string) => {
    if (!value.trim()) return 'Este campo es obligatorio';
    if (field === 'number' && (!/^\d{16}$/.test(value.replace(/\s/g, "")))) return 'Número inválido';
    if (field === 'expMonth' && (!/^\d{2}$/.test(value) || +value < 1 || +value > 12)) return 'Mes inválido';
    if (field === 'expYear' && !/^\d{2,4}$/.test(value)) return 'Año inválido';
    if (field === 'cvv' && !/^\d{3}$/.test(value)) return 'CVV inválido';
    return '';
  };

  // 3. Handlers para blur y change de método de pago
  const handlePaymentInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPaymentTouched((prev: any) => ({ ...prev, [name]: true }));
    const error = validatePaymentField(name, value);
    setPaymentErrors((prev: any) => ({ ...prev, [name]: error }));
  };
  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleCardInput(e);
    if (paymentTouched[e.target.name]) {
      const error = validatePaymentField(e.target.name, e.target.value);
      setPaymentErrors((prev: any) => ({ ...prev, [e.target.name]: error }));
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-purple-900 mb-8 text-center">Checkout</h1>
          {/* Selector de direcciones */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><MapPin className="h-5 w-5" /> Dirección de Envío</h2>
            {addressLoading ? (
              <div className="text-gray-500">Cargando direcciones...</div>
            ) : addressError ? (
              <div className="text-red-500">{addressError}</div>
            ) : addresses.length === 0 ? (
              <>
                <div className="mb-2 text-gray-500">No tienes direcciones guardadas.</div>
                <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                  <AddressForm
                    initialAddress={{
                      street: "",
                      city: "",
                      state: "",
                      zipCode: "",
                      country: "Panamá"
                    }}
                    onSave={async (address) => {
                      await handleSaveNewAddress({
                        street: address.street,
                        city: address.city,
                        state: address.state,
                        zipCode: address.zipCode,
                        country: address.country
                      });
                    }}
                    loading={addressLoading}
                    disabled={addressLoading}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2 mb-2">
                {addresses.map((a: any) => (
                  <div key={a.id} className={`flex flex-col gap-2 p-3 rounded border transition-all ${selectedAddressId === a.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                    {editingAddressId === a.id ? (
                      <>
                        <div className="flex flex-col gap-2">
                          <input className="input input-sm border rounded px-2 py-1" value={editAddressForm?.alias || ''} onChange={e => setEditAddressForm((f: any) => ({ ...f, alias: e.target.value }))} placeholder="Alias" />
                          <input className="input input-sm border rounded px-2 py-1" value={editAddressForm?.recipientName || ''} onChange={e => setEditAddressForm((f: any) => ({ ...f, recipientName: e.target.value }))} placeholder="Destinatario" />
                          <input className="input input-sm border rounded px-2 py-1" value={editAddressForm?.street || ''} onChange={e => setEditAddressForm((f: any) => ({ ...f, street: e.target.value }))} placeholder="Calle" />
                          <input className="input input-sm border rounded px-2 py-1" value={editAddressForm?.city || ''} onChange={e => setEditAddressForm((f: any) => ({ ...f, city: e.target.value }))} placeholder="Ciudad" />
                          <input className="input input-sm border rounded px-2 py-1" value={editAddressForm?.state || ''} onChange={e => setEditAddressForm((f: any) => ({ ...f, state: e.target.value }))} placeholder="Estado" />
                          <input className="input input-sm border rounded px-2 py-1" value={editAddressForm?.zipCode || ''} onChange={e => setEditAddressForm((f: any) => ({ ...f, zipCode: e.target.value }))} placeholder="Código Postal" />
                          <input className="input input-sm border rounded px-2 py-1" value={editAddressForm?.country || ''} onChange={e => setEditAddressForm((f: any) => ({ ...f, country: e.target.value }))} placeholder="País" />
                          <input className="input input-sm border rounded px-2 py-1" value={editAddressForm?.phone || ''} onChange={e => setEditAddressForm((f: any) => ({ ...f, phone: e.target.value }))} placeholder="Teléfono" />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={cancelEditAddress} disabled={addressLoading}>Cancelar</Button>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={saveEditAddress} disabled={addressLoading}>
                            {addressLoading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>}
                            Guardar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="addressRadio" value={a.id} checked={selectedAddressId === a.id} onChange={() => {
                          setSelectedAddressId(a.id);
                          setForm(f => ({ ...f, address: a }));
                        }} className="accent-indigo-600" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 flex items-center">{a.alias || "Dirección"} <span className="text-xs text-gray-500 ml-2">({a.recipientName || "Destinatario"})</span> {a.isDefault && <span className="ml-2 text-xs px-2 py-1 rounded bg-indigo-600 text-white flex items-center gap-1"><Star className="h-3 w-3" /> Principal</span>}</div>
                          <div className="text-xs text-gray-500">{a.street}, {a.city}, {a.state}, {a.zipCode}, {a.country}</div>
                          <div className="text-xs text-gray-500">Tel: {a.phone}</div>
                        </div>
                        <Button size="icon" variant="ghost" onClick={e => { e.preventDefault(); startEditAddress(a); }} title="Editar" disabled={addressLoading}><Edit className="h-4 w-4 text-indigo-600" /></Button>
                        <Button size="icon" variant="ghost" onClick={e => { e.preventDefault(); handleDeleteAddress(a.id); }} title="Eliminar" disabled={addressLoading}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-2 flex items-center gap-2" onClick={() => setShowNewAddress(v => !v)}><Plus className="h-4 w-4" /> {showNewAddress ? "Cancelar" : "Agregar nueva dirección"}</Button>
            {/* Al abrir AddressForm para agregar nueva dirección: */}
            {showNewAddress && (
              <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                <AddressForm
                  initialAddress={{
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "Panamá"
                  }}
                  onSave={async (address) => {
                    // Solo pasar los campos requeridos al backend
                    await handleSaveNewAddress({
                      street: address.street,
                      city: address.city,
                      state: address.state,
                      zipCode: address.zipCode,
                      country: address.country
                    });
                  }}
                  loading={addressLoading}
                  disabled={addressLoading}
                />
              </div>
            )}
          </div>
          {/* Selector de método de envío */}
          {selectedAddressId && (
            <div className="mb-4">
              <label className="block font-medium mb-1">Método de envío</label>
              <select
                value={shippingMethod || ''}
                onChange={e => setShippingMethod(e.target.value as ShippingMethod)}
                className="border rounded px-3 py-2"
                required
              >
                <option value="" disabled>Selecciona un método</option>
                {getAvailableShippingMethods(addresses.find((a: any) => a.id === selectedAddressId)).includes('personal') && (
                  <option value="personal">Entrega personal (La Chorrera) - $2.00</option>
                )}
                {getAvailableShippingMethods(addresses.find((a: any) => a.id === selectedAddressId)).includes('unoexpress') && (
                  <option value="unoexpress">Envío nacional Uno Express - Calculado</option>
                )}
              </select>
              {shippingMethod && (
                <div className="mt-2 text-sm text-gray-700">
                  <strong>Precio de envío:</strong> ${shippingCost.toFixed(2)}
                </div>
              )}
            </div>
          )}
          {/* Resumen visual de la dirección seleccionada */}
          {selectedAddressId && (
            <div className="mb-8 border rounded-lg p-4 bg-indigo-50 border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-1 flex items-center gap-2"><Home className="h-4 w-4" /> Dirección seleccionada</h3>
              {(() => {
                const a = addresses.find((a: any) => a.id === selectedAddressId);
                if (!a) return null;
                return (
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center">{a.alias || "Dirección"} <span className="text-xs text-gray-500 ml-2">({a.recipientName || "Destinatario"})</span> {a.isDefault && <span className="ml-2 text-xs px-2 py-1 rounded bg-indigo-600 text-white flex items-center gap-1"><Star className="h-3 w-3" /> Principal</span>}
                      <Button size="sm" variant="outline" className="ml-2" onClick={() => setEditingAddress(a)}>Editar</Button>
                    </div>
                    <div className="text-xs text-gray-700">{a.street}, {a.city}, {a.state}, {a.zipCode}, {a.country}</div>
                    <div className="text-xs text-gray-700">Tel: {a.phone}</div>
                  </div>
                );
              })()}
            </div>
          )}
          {/* Show AddressForm modal for editing address */}
          {editingAddress && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Pencil className="h-5 w-5" /> Editar dirección</h3>
                <AddressForm
                  initialAddress={editingAddress}
                  onSave={async (address) => {
                    setAddressLoading(true);
                    setAddressError(null);
                    try {
                      const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
                      const res = await fetch(`/api/addresses/${editingAddress.id}`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify(address),
                      });
                      if (!res.ok) throw new Error("Error al editar dirección");
                      const updated = await res.json();
                      // Actualizar addresses en el estado
                      setAddresses((prev: any[]) => prev.map(a => a.id === updated.id ? updated : a));
                      setEditingAddress(null);
                      toast({ title: "Dirección actualizada", description: "La dirección fue actualizada correctamente.", variant: "default" });
                    } catch (err: any) {
                      const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
                      setAddressError(errorToUse.message || "Error desconocido");
                      toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
                    } finally {
                      setAddressLoading(false);
                    }
                  }}
                  loading={addressLoading}
                  disabled={addressLoading}
                  noFormWrapper={true}
                />
                <div className="flex gap-2 justify-end mt-4">
                  <Button type="button" variant="outline" onClick={() => setEditingAddress(null)}>Cancelar</Button>
                </div>
              </div>
            </div>
          )}
          <form id="checkout-main-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-8">
            {/* Columna izquierda: datos de envío y pago */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre completo</label>
                <Input
                  ref={nameRef}
                  name="name"
                  value={form.name}
                  onChange={handlePersonalChange}
                  onBlur={handlePersonalBlur}
                  required
                  autoComplete="name"
                  className={personalErrors.name && personalTouched.name ? "border-red-500" : ""}
                />
                {personalErrors.name && personalTouched.name && <div className="text-red-500 text-xs mt-1">{personalErrors.name}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  name="email"
                  value={form.email}
                  onChange={handlePersonalChange}
                  onBlur={handlePersonalBlur}
                  required
                  autoComplete="email"
                  className={personalErrors.email && personalTouched.email ? "border-red-500" : ""}
                />
                {personalErrors.email && personalTouched.email && <div className="text-red-500 text-xs mt-1">{personalErrors.email}</div>}
              </div>
            <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handlePersonalChange}
                  onBlur={handlePersonalBlur}
                  required
                  autoComplete="tel"
                  className={personalErrors.phone && personalTouched.phone ? "border-red-500" : ""}
                />
                {personalErrors.phone && personalTouched.phone && <div className="text-red-500 text-xs mt-1">{personalErrors.phone}</div>}
              </div>
              {/* Dirección de envío con validación en tiempo real */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Dirección de Envío</h3>
                <Input
                  name="street"
                  value={form.address.street}
                  onChange={handleAddressInputChange}
                  onBlur={handleAddressInputBlur}
                  required
                  placeholder="Calle"
                  className={addressErrors.street && addressTouched.street ? "border-red-500" : ""}
                />
                {addressErrors.street && addressTouched.street && <div className="text-red-500 text-xs mt-1">{addressErrors.street}</div>}
                <Input
                  name="city"
                  value={form.address.city}
                  onChange={handleAddressInputChange}
                  onBlur={handleAddressInputBlur}
                  required
                  placeholder="Ciudad"
                  className={addressErrors.city && addressTouched.city ? "border-red-500" : ""}
                />
                {addressErrors.city && addressTouched.city && <div className="text-red-500 text-xs mt-1">{addressErrors.city}</div>}
                <Input
                  name="state"
                  value={form.address.state}
                  onChange={handleAddressInputChange}
                  onBlur={handleAddressInputBlur}
                  required
                  placeholder="Estado"
                  className={addressErrors.state && addressTouched.state ? "border-red-500" : ""}
                />
                {addressErrors.state && addressTouched.state && <div className="text-red-500 text-xs mt-1">{addressErrors.state}</div>}
                <Input
                  name="zipCode"
                  value={form.address.zipCode}
                  onChange={handleAddressInputChange}
                  onBlur={handleAddressInputBlur}
                  required
                  placeholder="Código Postal"
                  className={addressErrors.zipCode && addressTouched.zipCode ? "border-red-500" : ""}
                />
                {addressErrors.zipCode && addressTouched.zipCode && <div className="text-red-500 text-xs mt-1">{addressErrors.zipCode}</div>}
                <Input
                  name="country"
                  value={form.address.country}
                  onChange={handleAddressInputChange}
                  onBlur={handleAddressInputBlur}
                  required
                  placeholder="País"
                  className={addressErrors.country && addressTouched.country ? "border-red-500" : ""}
                />
                {addressErrors.country && addressTouched.country && <div className="text-red-500 text-xs mt-1">{addressErrors.country}</div>}
              </div>

              <div>
                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><CreditCard className="h-5 w-5" /> Método de Pago</h2>
                  <div className="flex gap-4 mb-4">
                    <Button variant={form.payment === "card" ? "default" : "outline"} onClick={() => { setForm(f => ({ ...f, payment: "card" })); setShowNewCard(false); }}>Tarjeta</Button>
                    <Button variant={form.payment === "paypal" ? "default" : "outline"} onClick={() => { setForm(f => ({ ...f, payment: "paypal" })); setShowNewCard(false); }}>Paypal</Button>
                </div>
                  {form.payment === "card" && (
                    <Elements stripe={stripePromise}>
                      <PaymentForm
                        amount={total}
                        onSuccess={async (paymentIntentId, cardEmail) => {
                          if (!user) {
                            toast({ title: "Debes iniciar sesión", description: "Inicia sesión para completar la compra.", variant: "destructive" });
                            return;
                          }
                          if (!selectedAddressId) {
                            toast({ title: "Selecciona una dirección", description: "Debes seleccionar una dirección de envío.", variant: "destructive" });
                            return;
                          }
                          const shippingAddress = addresses.find((a: any) => a.id === selectedAddressId);
                          if (!shippingAddress) {
                            toast({ title: "Error", description: "Dirección seleccionada no encontrada.", variant: "destructive" });
                            return;
                          }
                          setLoading(true);
                          try {
                            const res = await fetch("/api/orders", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                userId: user.id,
                                items: cart.map(item => ({
                                  productId: item.id,
                                  quantity: item.quantity,
                                  price: item.price
                                })),
                                totalAmount: total,
                                shippingAddress,
                                paymentMethod: "card",
                                paymentId: paymentIntentId,
                                paidAt: new Date().toISOString()
                              })
                            });
                            if (!res.ok) {
                              const error = await res.json();
                              toast({ title: "Error al registrar el pedido", description: error.message || "Intenta de nuevo más tarde.", variant: "destructive" });
                              setLoading(false);
                              return;
                            }
                            setLoading(false);
                            setSubmitted(true);
                            clearCart();
                            setShowStripeSuccess({ paymentId: paymentIntentId, email: cardEmail });
                          } catch (err: any) {
                            setLoading(false);
                            toast({ title: "Error de red", description: err?.message || "No se pudo conectar con el servidor.", variant: "destructive" });
                          }
                        }}
                        onError={(err) => {
                          toast({ title: "Error en Stripe", description: err?.toString() || "Error desconocido", variant: "destructive" });
                        }}
                        noFormWrapper={true}
                      />
                    </Elements>
                  )}
                  {form.payment === "paypal" && (
                    <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                      <PayPalButton
                        amount={total}
                        currency="USD"
                        onSuccess={async (orderId, payerEmail) => {
                          if (!user) {
                            toast({ title: "Debes iniciar sesión", description: "Inicia sesión para completar la compra.", variant: "destructive" });
                            return;
                          }
                          if (!selectedAddressId) {
                            toast({ title: "Selecciona una dirección", description: "Debes seleccionar una dirección de envío.", variant: "destructive" });
                            return;
                          }
                          const shippingAddress = addresses.find((a: any) => a.id === selectedAddressId);
                          if (!shippingAddress) {
                            toast({ title: "Error", description: "Dirección seleccionada no encontrada.", variant: "destructive" });
                            return;
                          }
                          setLoading(true);
                          try {
                            const res = await fetch("/api/orders", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                userId: user.id,
                                items: cart.map(item => ({
                                  productId: item.id,
                                  quantity: item.quantity,
                                  price: item.price
                                })),
                                totalAmount: total,
                                shippingAddress,
                                paymentMethod: "paypal",
                                paymentId: orderId,
                                paidAt: new Date().toISOString()
                              })
                            });
                            if (!res.ok) {
                              const error = await res.json();
                              toast({ title: "Error al registrar el pedido", description: error.message || "Intenta de nuevo más tarde.", variant: "destructive" });
                              setLoading(false);
                              return;
                            }
                            setLoading(false);
                            setSubmitted(true);
                            clearCart();
                            toast({
                              title: "¡Pago exitoso!",
                              description: `Tu pedido ha sido registrado.\nID de PayPal: ${orderId}${payerEmail ? `\nEmail de PayPal: ${payerEmail}` : ""}`,
                              variant: "default"
                            });
                            setTimeout(() => {
                              router.push("/orders");
                            }, 2000);
                          } catch (err: any) {
                            setLoading(false);
                            toast({ title: "Error de red", description: err?.message || "No se pudo conectar con el servidor.", variant: "destructive" });
                          }
                        }}
                        onError={(err) => {
                          toast({ title: "Error en PayPal", description: err?.toString() || "Error desconocido", variant: "destructive" });
                        }}
                      />
                </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columna derecha: resumen del pedido */}
            <div className="bg-indigo-50 rounded-lg p-6 shadow-inner">
              <h3 className="font-semibold text-lg mb-4 text-indigo-800 flex items-center gap-2"><CreditCard className="h-5 w-5" /> Resumen del pedido</h3>
              <ul className="divide-y divide-indigo-100 mb-4">
                {cart.map(item => (
                  <li key={item.id} className="py-2 flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.name} <span className="text-xs text-gray-500">x{item.quantity}</span></span>
                    <span className="text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Envío</span>
                <span className="text-gray-900 font-medium">${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
                        </div>
              {/* Método de pago seleccionado */}
              {selectedPaymentId && (
                <div className="mt-4 p-3 rounded bg-white border flex items-center gap-3">
                  {(() => {
                    const m = paymentMethods.find((m: any) => m.id === selectedPaymentId);
                    if (!m) return null;
                    return (
                      <div className="flex items-center gap-2">
                        {getCardIcon(m.brand)}
                        <span className="font-medium text-gray-900">{m.brand} •••• {m.last4}</span>
                        <Button size="sm" variant="outline" className="ml-2" onClick={() => setEditingPayment(m)}>Editar</Button>
                      </div>
                    );
                  })()}
                </div>
              )}
              <Button type="submit" className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center" disabled={loading}>
                {loading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>}
                {loading ? "Procesando..." : "Confirmar compra"}
              </Button>
            </div>
          </form>
        </div>
        <CartRecommendations excludeIds={cart.map(i => i.id)} />
      </div>
      {/* Modal de edición de tarjeta */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Pencil className="h-5 w-5" /> Editar tarjeta</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Marca</label>
                <select name="brand" value={editForm.brand} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2">
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Últimos 4 dígitos</label>
                <Input name="last4" maxLength={4} value={editForm.last4} onChange={handleEditFormChange} required pattern="\d{4}" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Mes</label>
                  <Input name="expMonth" maxLength={2} value={editForm.expMonth} onChange={handleEditFormChange} required pattern="\d{1,2}" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Año</label>
                  <Input name="expYear" maxLength={4} value={editForm.expYear} onChange={handleEditFormChange} required pattern="\d{2,4}" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" name="isDefault" checked={editForm.isDefault} onChange={e => setEditForm(f => ({ ...f, isDefault: e.target.checked }))} />
                <span>Usar como método principal</span>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setEditingPayment(null)}>Cancelar</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={savingEdit}>{savingEdit ? "Guardando..." : "Guardar cambios"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showStripeSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-4">¡Pago exitoso!</h2>
            <p className="mb-2 text-gray-700">Tu pedido ha sido registrado correctamente.</p>
            <div className="mb-2 text-sm text-gray-600">ID de pago: <span className="font-mono">{showStripeSuccess.paymentId}</span></div>
            {showStripeSuccess.email && <div className="mb-4 text-sm text-gray-600">Email: <span className="font-mono">{showStripeSuccess.email}</span></div>}
            <Button className="bg-indigo-600 hover:bg-indigo-700 w-full" onClick={() => { setShowStripeSuccess(null); router.push("/orders"); }}>
              Ver mis pedidos
            </Button>
          </div>
        </div>
      )}
      {/* Mensajes de stock */}
      {cart.map(item => stockMessages[item.id] && (
        <div key={item.id} className="text-xs text-red-500 mb-2">{stockMessages[item.id]}</div>
      ))}
      {/* Sticky summary solo en móvil */}
      <OrderSummarySticky
        subtotal={subtotal}
        shipping={shippingCost}
        total={total}
        loading={loading}
        paymentMethod={(() => {
          const m = paymentMethods.find((m: any) => m.id === selectedPaymentId);
          return m ? `${m.brand} •••• ${m.last4}` : undefined;
        })()}
        onEditCart={() => router.push('/cart')}
      />
    </AuthGuard>
  )
}
