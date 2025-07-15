import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import countryRegionData from 'country-region-data/dist/data-umd';

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
    country: ""
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [success, setSuccess] = useState(false);

  // Estados para selects dependientes
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [regionList, setRegionList] = useState<string[]>([]);
  const [cityList, setCityList] = useState<string[]>([]);

  // Initialize country, region, and city from initialAddress if provided
  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
      setCountry(initialAddress.country || '');
      setRegion(initialAddress.state || '');
      setCity(initialAddress.city || '');
    }
  }, [initialAddress]);

  // Actualizar regiones al cambiar país
  useEffect(() => {
    if (country) {
      const found = (countryRegionData || []).find(
        (c) => Array.isArray(c) && typeof c[0] === 'string' && c[0] === country
      );
      setRegionList(found ? found[2].map((r: any) => Array.isArray(r) && typeof r[0] === 'string' ? r[0] : '') : []);
      setRegion('');
      setCity('');
      setCityList([]);
    } else {
      setRegionList([]);
      setRegion('');
      setCity('');
      setCityList([]);
    }
  }, [country]);

  // Actualizar ciudades al cambiar región (si hay datos)
  useEffect(() => {
    if (country && region) {
      const found = (countryRegionData || []).find(
        (c) => Array.isArray(c) && typeof c[0] === 'string' && c[0] === country
      );
      const reg = found && Array.isArray(found[2])
        ? found[2].find((r: any) => Array.isArray(r) && typeof r[0] === 'string' && r[0] === region)
        : undefined;
      if (reg && Array.isArray(reg[2])) {
        setCityList(reg[2]);
      } else {
        setCityList([]);
      }
      setCity('');
    } else {
      setCityList([]);
      setCity('');
    }
  }, [country, region]);

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
          disabled={loading || disabled || saving}
          autoComplete="street-address"
          required
        />
        {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
      </div>
      <div>
        <Label htmlFor="country">País</Label>
        <Input
          list="country-list"
          id="country"
          name="country"
          value={country}
          onChange={e => {
            setCountry(e.target.value);
            setAddress(prev => ({ ...prev, country: e.target.value }));
          }}
          disabled={loading || disabled || saving}
          autoComplete="country"
          required
          className="mb-1 border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <datalist id="country-list">
          {(countryRegionData || []).map((c, i) => {
            if (Array.isArray(c) && typeof c[0] === 'string' && typeof c[1] === 'string') {
              return <option key={c[1]} value={c[0]} />;
            }
            return null;
          })}
        </datalist>
        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
      </div>
      <div>
        <Label htmlFor="state">Provincia/Estado</Label>
        <Input
          list="region-list"
          id="state"
          name="state"
          value={region}
          onChange={e => {
            setRegion(e.target.value);
            setAddress(prev => ({ ...prev, state: e.target.value }));
          }}
          disabled={loading || disabled || saving || !country}
          autoComplete="address-level1"
          required
          className="mb-1 border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <datalist id="region-list">
          {regionList.map(r => <option key={r} value={r} />)}
        </datalist>
        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
      </div>
      <div>
        <Label htmlFor="city">Ciudad/Distrito</Label>
        <Input
          list="city-list"
          id="city"
          name="city"
          value={city}
          onChange={e => {
            setCity(e.target.value);
            setAddress(prev => ({ ...prev, city: e.target.value }));
          }}
          disabled={loading || disabled || saving || !region}
          autoComplete="address-level2"
          required
          className="mb-1 border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <datalist id="city-list">
          {cityList.map(city => <option key={city} value={city} />)}
        </datalist>
        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
      </div>
      <div>
        <Label htmlFor="zipCode">Código Postal</Label>
        <Input
          id="zipCode"
          name="zipCode"
          value={address.zipCode}
          onChange={handleChange}
          disabled={loading || disabled || saving}
          autoComplete="postal-code"
          required
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