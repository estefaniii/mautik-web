import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Eye, Lock, Users } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-purple-800 mr-3" />
              <h1 className="font-display text-4xl font-bold text-purple-900">Política de Privacidad</h1>
            </div>
            <p className="text-gray-600">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 mr-2" />
                Información que Recopilamos
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  En Mautik, recopilamos la siguiente información para brindarte la mejor experiencia posible:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Información personal:</strong> Nombre, dirección de correo electrónico, dirección de envío y número de teléfono</li>
                  <li><strong>Información de pago:</strong> Datos de tarjetas de crédito procesados de forma segura por nuestros proveedores de pago</li>
                  <li><strong>Información de navegación:</strong> Cookies y datos de uso del sitio web</li>
                  <li><strong>Información de pedidos:</strong> Historial de compras y preferencias</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                <Lock className="h-6 w-6 mr-2" />
                Cómo Utilizamos tu Información
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>Utilizamos tu información para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Procesar y completar tus pedidos</li>
                  <li>Comunicarnos contigo sobre tu cuenta y pedidos</li>
                  <li>Enviar información sobre productos y ofertas especiales (con tu consentimiento)</li>
                  <li>Mejorar nuestros productos y servicios</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2" />
                Compartir Información
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Proveedores de servicios:</strong> Para procesar pagos y envíos</li>
                  <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley</li>
                  <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos y seguridad</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4">Seguridad de Datos</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encriptación SSL para todas las transacciones</li>
                  <li>Acceso restringido a información personal</li>
                  <li>Monitoreo regular de seguridad</li>
                  <li>Cumplimiento con estándares de seguridad de la industria</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4">Tus Derechos</h2>
              <div className="space-y-4 text-gray-700">
                <p>Tienes derecho a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Acceder a tu información personal</li>
                  <li>Corregir información inexacta</li>
                  <li>Solicitar la eliminación de tus datos</li>
                  <li>Retirar tu consentimiento en cualquier momento</li>
                  <li>Oponerte al procesamiento de tus datos</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4">Cookies</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Puedes controlar el uso de cookies a través de la configuración de tu navegador.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4">Contacto</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Si tienes preguntas sobre esta política de privacidad, contáctanos:
                </p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p><strong>Email:</strong> mautik.official@gmail.com</p>
                  <p><strong>Dirección:</strong> La Chorrera, Panama Oeste, Panamá</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
