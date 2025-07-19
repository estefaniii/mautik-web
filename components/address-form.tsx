import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { provincias, provinciasDistritos } from '@/lib/panama-regions';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface AddressFormProps {
  initialAddress?: Address;
  onSave: (address: Address) => Promise<void> | void;
  loading?: boolean;
  disabled?: boolean;
  noFormWrapper?: boolean; // New prop to control form wrapper rendering
}

export default function AddressForm({ initialAddress, onSave, loading, disabled, noFormWrapper = false }: AddressFormProps) {
  const { toast } = useToast();
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Panamá"
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof Address, boolean>>>({});

  // Estados para país, provincia y distrito
  const [country, setCountry] = useState<string>(initialAddress?.country || 'Panamá');
  const [province, setProvince] = useState<string>(initialAddress?.state || '');
  const [district, setDistrict] = useState<string>(initialAddress?.city || '');
  const [cityList, setCityList] = useState<string[]>(province ? (provinciasDistritos[province] || []) : []);

  // Inicializar valores desde initialAddress si existe
  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
      setCountry(initialAddress.country || 'Panamá');
      setProvince(initialAddress.state || '');
      setDistrict(initialAddress.city || '');
      setCityList(initialAddress.state ? (provinciasDistritos[initialAddress.state] || []) : []);
    }
  }, [initialAddress]);

  // Actualizar ciudades al cambiar provincia
  useEffect(() => {
    if (province) {
      setCityList(provinciasDistritos[province] || []);
      setDistrict('');
    } else {
      setCityList([]);
      setDistrict('');
    }
  }, [province]);

  const validate = (addr: Address) => {
    const newErrors: Partial<Record<keyof Address, string>> = {};
    if (!addr.street.trim()) newErrors.street = "La calle es obligatoria";
    if (!addr.city.trim()) newErrors.city = "La ciudad es obligatoria";
    if (!addr.state.trim()) newErrors.state = "La provincia/estado es obligatoria";
    if (!addr.zipCode.trim()) newErrors.zipCode = "El código postal es obligatorio";
    else if (!/^[A-Za-z0-9]{4,}$/.test(addr.zipCode.trim())) newErrors.zipCode = "El código postal debe tener al menos 4 caracteres (letras o números)";
    if (!addr.country.trim()) newErrors.country = "El país es obligatorio";
    else if (addr.country.trim().length < 2) newErrors.country = "El país debe tener al menos 2 caracteres";
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const validationErrors = validate({ ...address, [name]: address[name as keyof Address] });
    setErrors(prev => ({ ...prev, [name]: validationErrors[name as keyof Address] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const validationErrors = validate(address);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: "❌ Error",
        description: "Corrige los errores en el formulario.",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      await onSave({
        street: address.street.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        zipCode: address.zipCode.trim(),
        country: address.country.trim()
      });
      setSuccess(true);
      toast({
        title: "✅ Dirección guardada",
        description: "Tu dirección se guardó correctamente.",
        variant: "default"
      });
    } finally {
      setSaving(false);
    }
  };

  const formFields = (
    <>
      <div>
        <Label htmlFor="street">Calle y número</Label>
        <Input
          id="street"
          name="street"
          value={address.street}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading || disabled || saving}
          autoComplete="street-address"
          required
          className={errors.street && touched.street ? "border-red-500" : ""}
        />
        {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
      </div>
      <div>
        <Label htmlFor="country">País</Label>
        <Input
          id="country"
          name="country"
          value={country}
          onChange={e => {
            setCountry(e.target.value);
            setAddress(prev => ({ ...prev, country: e.target.value }));
          }}
          onBlur={handleBlur}
          disabled={loading || disabled || saving}
          autoComplete="country"
          required
          className={`mb-1 border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.country && touched.country ? "border-red-500" : ""}`}
        />
        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
      </div>
      <div>
        <Label htmlFor="state">Provincia</Label>
        <select
          id="state"
          name="state"
          value={province}
          onChange={e => {
            setProvince(e.target.value);
            setAddress(prev => ({ ...prev, state: e.target.value }));
            setDistrict('');
            setAddress(prev => ({ ...prev, city: '' }));
          }}
          onBlur={handleBlur}
          disabled={loading || disabled || saving || !country}
          required
          className={`mb-1 border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.state && touched.state ? "border-red-500" : ""}`}
        >
          <option value="">Selecciona una provincia</option>
          {provincias.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
      </div>
      <div>
        <Label htmlFor="city">Ciudad/Distrito</Label>
        <select
          id="city"
          name="city"
          value={district}
          onChange={e => {
            setDistrict(e.target.value);
            setAddress(prev => ({ ...prev, city: e.target.value }));
          }}
          onBlur={handleBlur}
          disabled={loading || disabled || saving || !province}
          required
          className={`mb-1 border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.city && touched.city ? "border-red-500" : ""}`}
        >
          <option value="">Selecciona un distrito</option>
          {province && (provinciasDistritos[province] || []).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
      </div>
      <div>
        <Label htmlFor="zipCode">Código Postal</Label>
        <Input
          id="zipCode"
          name="zipCode"
          value={address.zipCode}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading || disabled || saving}
          autoComplete="postal-code"
          required
          className={errors.zipCode && touched.zipCode ? "border-red-500" : ""}
        />
        {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
      </div>
      {!noFormWrapper && (
        <Button type="submit" disabled={loading || disabled || saving} className="w-full mt-2">
          {saving || loading ? "Guardando..." : "Guardar dirección"}
        </Button>
      )}
      {success && <p className="text-green-600 text-sm mt-2">¡Dirección guardada correctamente!</p>}
    </>
  );

  if (noFormWrapper) {
    return <div className="space-y-4">{formFields}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formFields}
    </form>
  );
} 