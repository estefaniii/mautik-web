"use client"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>¡Ha ocurrido un error inesperado!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()} style={{ marginTop: 20, padding: 10 }}>
        Intentar de nuevo
      </button>
    </div>
  )
}
