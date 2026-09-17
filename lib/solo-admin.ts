import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

/**
 * Guardia de administración para las rutas que escriben.
 *
 * Hacía falta porque `POST /api/products`, `PUT /api/products/[id]` y
 * `DELETE /api/products/[id]` NO pedían absolutamente nada: cualquiera con la
 * URL podía crear productos, cambiarles el precio o borrar el catálogo entero.
 * Los ids son públicos (salen en `GET /api/products`), así que no hacía falta
 * ni adivinarlos. Verificado en producción: un PUT sin sesión llegaba hasta la
 * validación del cuerpo en vez de cortarse con un 401.
 *
 * Se apoya en `getAuthUser`, que resuelve tanto la sesión de NextAuth (Google
 * y credenciales) como la cookie `auth-token` del login propio, y después
 * comprueba `isAdmin` CONTRA LA BASE, no contra el token: si alguien pierde el
 * permiso, deja de tenerlo en la siguiente petición sin esperar a que expire
 * la sesión.
 *
 * Devuelve null si puede pasar, o la respuesta de error si no.
 */
export async function exigirAdmin(request: NextRequest): Promise<NextResponse | null> {
  const usuario = await getAuthUser(request);

  if (!usuario) {
    return NextResponse.json(
      { error: "Tienes que iniciar sesión." },
      { status: 401 }
    );
  }
  if (!usuario.isAdmin) {
    // 404 a propósito en vez de 403: a quien no es admin no le confirmamos
    // siquiera que la ruta de administración existe.
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }
  return null;
}
