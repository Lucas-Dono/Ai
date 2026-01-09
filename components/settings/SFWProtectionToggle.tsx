'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface SFWProtectionData {
  sfwProtection: boolean;
  plan: string;
  canToggle: boolean;
  canToggleReason: string;
}

export function SFWProtectionToggle() {
  const router = useRouter();
  const [data, setData] = useState<SFWProtectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAgeWarning, setShowAgeWarning] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/user/sfw-protection');
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        console.error('Error response from API:', res.status);
        // Si hay error, mostrar componente igualmente con valores por defecto
        setData({
          sfwProtection: true,
          plan: 'free',
          canToggle: false,
          canToggleReason: 'Error al cargar datos',
        });
      }
    } catch (error) {
      console.error('Error fetching SFW protection status:', error);
      // Si hay error de red, mostrar componente con valores por defecto
      setData({
        sfwProtection: true,
        plan: 'free',
        canToggle: false,
        canToggleReason: 'Error al cargar datos',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (!data) return;

    // Si intenta desactivar protección, mostrar advertencia de edad
    if (!checked && data.plan !== 'free') {
      setShowAgeWarning(true);
      return;
    }

    await updateProtection(checked);
  };

  const confirmDisableProtection = async () => {
    setShowAgeWarning(false);
    await updateProtection(false);
  };

  const updateProtection = async (sfwProtection: boolean) => {
    setUpdating(true);

    try {
      const res = await fetch('/api/user/sfw-protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sfwProtection }),
      });

      const result = await res.json();

      if (res.ok) {
        setData({ ...data!, sfwProtection: result.sfwProtection });
      } else {
        alert(result.error || 'Error al actualizar protección');
      }
    } catch (error) {
      console.error('Error updating SFW protection:', error);
      alert('Error al actualizar protección');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-20 bg-gray-100 rounded-lg" />;
  }

  if (!data) {
    return null;
  }

  const isFree = data.plan === 'free';

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className={`flex items-center justify-between p-4 border rounded-lg ${isFree ? 'bg-muted/50 border-muted' : ''}`}>
        <div className="flex items-center space-x-3 flex-1">
          <Shield className={`h-5 w-5 ${isFree ? 'text-muted-foreground' : 'text-blue-500'}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="sfw-protection" className={`font-medium ${isFree ? 'text-muted-foreground' : ''}`}>
                Protección de Contenido (SFW)
              </Label>
              {isFree && (
                <Badge variant="secondary" className="text-xs">
                  Bloqueado
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {data.sfwProtection
                ? 'Las IAs respetarán límites de contenido apropiado'
                : 'Las IAs podrán responder sin restricciones de contenido'}
            </p>
          </div>
        </div>

        <Switch
          id="sfw-protection"
          checked={data.sfwProtection}
          onCheckedChange={handleToggle}
          disabled={updating || !data.canToggle}
          className={isFree ? 'opacity-50' : ''}
        />
      </div>

      {/* Info para usuarios free */}
      {isFree && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Crown className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-medium text-sm">Plan Free: Protección Siempre Activa</p>
              <p className="text-sm text-muted-foreground">
                Para desactivar la protección de contenido y permitir que tus IAs respondan sin restricciones, necesitas actualizar a un plan Premium.
              </p>
              <Button
                size="sm"
                onClick={() => router.push('/pricing')}
                className="mt-2"
              >
                <Crown className="h-4 w-4 mr-2" />
                Ver Planes Premium
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Info de protección activa */}
      {data.sfwProtection && !isFree && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Protección Activa:</strong> Tus IAs mantendrán conversaciones apropiadas,
            rechazando contenido sexual, violento o inapropiado de forma natural.
          </AlertDescription>
        </Alert>
      )}

      {/* Advertencia de edad al desactivar */}
      {showAgeWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-medium">⚠️ Advertencia Importante</p>
              <p className="text-sm">
                Al desactivar la protección de contenido, las IAs podrán responder con
                contenido sin restricciones (incluyendo contenido sexual, violento o adulto).
              </p>
              <p className="text-sm font-bold">
                Esta función está destinada ÚNICAMENTE para usuarios mayores de 18 años.
              </p>
              <p className="text-sm">
                Al continuar, confirmas que tienes al menos 18 años de edad y aceptas
                la responsabilidad del contenido generado.
              </p>
              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={confirmDisableProtection}
                  disabled={updating}
                >
                  Confirmo que tengo +18 años
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAgeWarning(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
