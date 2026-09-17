"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCw, Check, X, Download, Trash2, Maximize2 } from "lucide-react";

/**
 * Editor de la foto de un producto: girar y recortar.
 *
 * Dos cosas que estaban mal en la versión anterior:
 *
 *  · **Al girar, el recuadro dejaba de cuadrar con la foto.** La imagen se
 *    rotaba con `transform: rotate()` de CSS, que gira lo que se ve pero NO la
 *    caja que ocupa en el layout. El recuadro de recorte se posicionaba sobre
 *    esa caja sin girar, así que después de girar señalaba cualquier cosa.
 *    Ahora la vista es un `<canvas>` donde la foto ya se dibuja girada: lo que
 *    se ve y lo que se recorta son lo mismo.
 *
 *  · **Al abrir ya venía recortada.** Arrancaba con el encuadre 3:4 puesto y
 *    todo lo demás oscurecido, como si hubiera que deshacer algo antes de
 *    empezar. Ahora abre con la foto entera y sin nada oscurecido; el recorte
 *    empieza cuando se mueve el recuadro.
 */

interface Props {
  src: string;
  abierto: boolean;
  onCerrar: () => void;
  onGuardado: (url: string) => void;
  onEliminar?: () => void;
}

type Caja = { x: number; y: number; w: number; h: number }; // fracciones 0..1

const COMPLETA: Caja = { x: 0, y: 0, w: 1, h: 1 };
const RATIO_TIENDA = 3 / 4;

export default function EditorImagen({ src, abierto, onCerrar, onGuardado, onEliminar }: Props) {
  const vistaRef = useRef<HTMLCanvasElement>(null);
  const marcoRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [cargada, setCargada] = useState(false);
  const [giro, setGiro] = useState(0);
  const [caja, setCaja] = useState<Caja>(COMPLETA);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const arrastre = useRef<{ tipo: string; x0: number; y0: number; caja: Caja; rect: DOMRect } | null>(null);

  /** Medidas de la foto ya girada. */
  const medidas = useCallback(() => {
    const img = imgRef.current;
    if (!img) return { w: 0, h: 0 };
    const vertical = giro % 180 !== 0;
    return {
      w: vertical ? img.naturalHeight : img.naturalWidth,
      h: vertical ? img.naturalWidth : img.naturalHeight,
    };
  }, [giro]);

  /** Dibuja la foto girada en el lienzo de vista. */
  const pintar = useCallback(() => {
    const img = imgRef.current;
    const c = vistaRef.current;
    if (!img || !c) return;
    const { w, h } = medidas();
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((giro * Math.PI) / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  }, [giro, medidas]);

  useEffect(() => {
    if (!abierto || !src) return;
    setGiro(0);
    setCaja(COMPLETA);
    setError(null);
    setCargada(false);
    const img = new Image();
    // Sin esto, el canvas queda "manchado" y toBlob falla con SecurityError.
    img.crossOrigin = "anonymous";
    img.onload = () => { imgRef.current = img; setCargada(true); };
    img.onerror = () => setError("No se pudo cargar la imagen.");
    img.src = src;
  }, [abierto, src]);

  useEffect(() => { if (cargada) pintar(); }, [cargada, giro, pintar]);

  const girar = () => {
    setGiro((g) => (g + 90) % 360);
    // Al girar, el recorte anterior ya no significa nada: se vuelve a la foto entera.
    setCaja(COMPLETA);
  };

  const encuadrarTienda = () => {
    const { w, h } = medidas();
    if (!w || !h) return;
    if (w / h > RATIO_TIENDA) {
      const ancho = (RATIO_TIENDA * h) / w;
      setCaja({ x: (1 - ancho) / 2, y: 0, w: ancho, h: 1 });
    } else {
      const alto = w / RATIO_TIENDA / h;
      setCaja({ x: 0, y: (1 - alto) / 2, w: 1, h: alto });
    }
  };

  const alBajar = (e: React.PointerEvent, tipo: string) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = marcoRef.current?.getBoundingClientRect();
    if (!rect) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    arrastre.current = { tipo, x0: e.clientX, y0: e.clientY, caja: { ...caja }, rect };
  };

  const alMover = (e: React.PointerEvent) => {
    const a = arrastre.current;
    if (!a) return;
    const dx = (e.clientX - a.x0) / a.rect.width;
    const dy = (e.clientY - a.y0) / a.rect.height;
    let { x, y, w, h } = a.caja;
    const MIN = 0.1;

    if (a.tipo === "mover") {
      x = Math.min(Math.max(x + dx, 0), 1 - w);
      y = Math.min(Math.max(y + dy, 0), 1 - h);
    } else {
      if (a.tipo.includes("e")) w = Math.min(Math.max(w + dx, MIN), 1 - x);
      if (a.tipo.includes("s")) h = Math.min(Math.max(h + dy, MIN), 1 - y);
      if (a.tipo.includes("w")) { const nx = Math.min(Math.max(x + dx, 0), x + w - MIN); w += x - nx; x = nx; }
      if (a.tipo.includes("n")) { const ny = Math.min(Math.max(y + dy, 0), y + h - MIN); h += y - ny; y = ny; }
    }
    setCaja({ x, y, w, h });
  };

  const alSoltar = () => { arrastre.current = null; };

  const renderizar = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const img = imgRef.current;
      if (!img) return resolve(null);
      const { w, h } = medidas();
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(w * caja.w));
      c.height = Math.max(1, Math.round(h * caja.h));
      const ctx = c.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.save();
      ctx.translate(-caja.x * w, -caja.y * h);
      ctx.translate(w / 2, h / 2);
      ctx.rotate((giro * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();
      c.toBlob((b) => resolve(b), "image/jpeg", 0.92);
    });

  const descargar = async () => {
    const b = await renderizar();
    if (!b) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "mautik-foto.jpg";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const blob = await renderizar();
      if (!blob) { setError("No se pudo procesar la imagen."); return; }
      const fd = new FormData();
      fd.append("file", new File([blob], "foto.jpg", { type: "image/jpeg" }));
      fd.append("proposito", "producto");
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "No se pudo subir."); return; }
      onGuardado(data.url || data.imageUrl);
      onCerrar();
    } catch {
      setError("Error de conexión al subir.");
    } finally {
      setGuardando(false);
    }
  };

  if (!abierto) return null;

  const recortada = caja.x > 0.001 || caja.y > 0.001 || caja.w < 0.999 || caja.h < 0.999;
  const sinTocar = giro === 0 && !recortada;

  const manijas: Array<[string, string]> = [
    ["nw", "-top-2 -left-2 cursor-nwse-resize"],
    ["ne", "-top-2 -right-2 cursor-nesw-resize"],
    ["sw", "-bottom-2 -left-2 cursor-nesw-resize"],
    ["se", "-bottom-2 -right-2 cursor-nwse-resize"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onCerrar}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-card p-4 shadow-2xl sm:p-5"
        onClick={(e) => e.stopPropagation()}>

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-purple-900 dark:text-purple-100">Editar foto</h3>
          <button type="button" onClick={onCerrar} aria-label="Cerrar"
            className="grid h-8 w-8 place-items-center rounded-full text-gray-500 hover:bg-purple-50 dark:text-purple-100/60 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 flex h-[46vh] min-h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-purple-50 p-2 dark:bg-white/5">
          <div
            ref={marcoRef}
            className="relative h-full touch-none select-none"
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerCancel={alSoltar}
          >
            <canvas ref={vistaRef} className="block h-full w-auto max-w-full rounded-lg" />

            {cargada && (
              <div
                className="absolute cursor-move rounded-sm ring-2 ring-white"
                style={{
                  left: `${caja.x * 100}%`, top: `${caja.y * 100}%`,
                  width: `${caja.w * 100}%`, height: `${caja.h * 100}%`,
                  // solo se oscurece si de verdad hay algo recortado
                  boxShadow: recortada ? "0 0 0 9999px rgba(0,0,0,0.55)" : "none",
                }}
                onPointerDown={(e) => alBajar(e, "mover")}
              >
                <div className="pointer-events-none absolute inset-0 opacity-50">
                  <div className="absolute left-1/3 top-0 h-full w-px bg-white" />
                  <div className="absolute left-2/3 top-0 h-full w-px bg-white" />
                  <div className="absolute left-0 top-1/3 h-px w-full bg-white" />
                  <div className="absolute left-0 top-2/3 h-px w-full bg-white" />
                </div>
                {manijas.map(([tipo, clase]) => (
                  <span key={tipo} onPointerDown={(e) => alBajar(e, tipo)}
                    className={`absolute h-4 w-4 rounded-full border-2 border-purple-700 bg-white shadow ${clase}`} />
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-400/10 dark:text-red-300">{error}</p>
        )}

        <p className="mb-3 text-xs text-gray-500 dark:text-purple-100/50">
          Arrastra el recuadro para elegir qué parte queda; estira las esquinas para
          agrandarlo o achicarlo.
        </p>

        {/* Una sola fila de herramientas. Girar es un solo botón —siempre en el
            mismo sentido, cuatro toques dan la vuelta entera— y descargar y
            eliminar van solo con su icono: se entienden sin texto. */}
        <div className="mb-3 flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={girar}>
            <RotateCw className="mr-1.5 h-4 w-4" /> Girar
          </Button>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={encuadrarTienda}>
            3:4
          </Button>
          <Button type="button" variant="outline" size="sm" className="rounded-full"
            onClick={() => setCaja(COMPLETA)} disabled={!recortada} aria-label="Ver la foto entera" title="Ver la foto entera">
            <Maximize2 className="h-4 w-4" />
          </Button>

          <span className="flex-1" />

          <Button type="button" variant="outline" size="sm" className="h-9 w-9 rounded-full p-0"
            onClick={descargar} aria-label="Descargar" title="Descargar">
            <Download className="h-4 w-4" />
          </Button>
          {onEliminar && (
            <Button type="button" variant="outline" size="sm" aria-label="Quitar esta foto" title="Quitar esta foto"
              className="h-9 w-9 rounded-full p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-400/10"
              onClick={() => { onEliminar(); onCerrar(); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          className="h-11 w-full rounded-full disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:bg-white/10 dark:disabled:text-purple-100/40"
          disabled={guardando || sinTocar}
          onClick={guardar}
        >
          <Check className="mr-2 h-4 w-4" />
          {guardando ? "Guardando…" : "Guardar como foto nueva"}
        </Button>
        <p className="mt-2 text-center text-xs text-gray-500 dark:text-purple-100/50">
          {sinTocar
            ? "Gira o recorta la foto para poder guardarla."
            : "La foto original no se borra: se guarda una versión nueva."}
        </p>
      </div>
    </div>
  );
}
