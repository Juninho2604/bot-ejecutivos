'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CheckoutForm({ plan }) {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, ...form }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || 'No se pudo iniciar el pago. Intenta de nuevo.');
        setLoading(false);
        return;
      }

      // Redirige al link de pago de VenePagos.
      window.location.href = data.url;
    } catch {
      setError('Ocurrió un error de red. Intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input id="nombre" value={form.nombre} onChange={update('nombre')} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={update('email')}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefono">WhatsApp (con código de país)</Label>
        <Input
          id="telefono"
          type="tel"
          placeholder="584121234567"
          value={form.telefono}
          onChange={update('telefono')}
          required
        />
        <p className="text-xs text-white/60">
          Aquí recibirás tus recordatorios. Ej: 584121234567
        </p>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Button
        type="submit"
        className="w-full rounded-full bg-yellow-400 font-semibold text-slate-900 hover:bg-yellow-300"
        size="lg"
        disabled={loading}
      >
        {loading && <Loader2 className="animate-spin" />}
        Ir a pagar
      </Button>
      <p className="text-center text-xs text-white/60">
        Pago seguro procesado por VenePagos.
      </p>
    </form>
  );
}
