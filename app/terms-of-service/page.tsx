import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, ShoppingBag, CreditCard, Truck, Shield } from "lucide-react"

export default function TermsOfServicePage() {
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
              <FileText className="h-8 w-8 text-purple-800 mr-3" />
              <h1 className="font-display text-4xl font-bold text-purple-900">Términos de Servicio</h1>
            </div>
            <p className="text-gray-600">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2" />
                Aceptación de Términos
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Al acceder y utilizar el sitio web de Mautik, aceptas estar sujeto a estos términos y condiciones de servicio. 
                  Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                <CreditCard className="h-6 w-6 mr-2" />
                Pedidos y Pagos
              </h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Proceso de Pedidos:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Todos los pedidos están sujetos a disponibilidad de productos</li>
                  <li>Nos reservamos el derecho de rechazar cualquier pedido</li>
                  <li>Los precios están sujetos a cambios sin previo aviso</li>
                  <li>El pago se procesa al momento de realizar el pedido</li>
                </ul>
                
                <p><strong>Métodos de Pago:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Tarjetas de crédito y débito</li>
                  <li>Transferencias bancarias</li>
                  <li>Pagos móviles (según disponibilidad)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                <Truck className="h-6 w-6 mr-2" />
                Envíos y Entregas
              </h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Política de Envíos:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Envío gratuito en pedidos superiores a $50</li>
                  <li>Tiempo de entrega estimado: 3-7 días hábiles</li>
                  <li>Envíos a todo Panamá</li>
                  <li>Seguimiento de pedidos disponible</li>
                </ul>
                
                <p><strong>Responsabilidades:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>El cliente es responsable de proporcionar una dirección de entrega correcta</li>
                  <li>Los productos artesanales pueden tener pequeñas variaciones</li>
                  <li>No nos hacemos responsables por daños durante el transporte</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-2" />
                Devoluciones y Reembolsos
              </h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Política de Devoluciones:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Devoluciones aceptadas dentro de los 14 días posteriores a la compra</li>
                  <li>Productos deben estar en su estado original y empaquetado</li>
                  <li>No se aceptan devoluciones de productos personalizados</li>
                  <li>Los gastos de envío de devolución corren por cuenta del cliente</li>
                </ul>
                
                <p><strong>Proceso de Reembolso:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Reembolsos procesados en 5-10 días hábiles</li>
                  <li>Se reembolsa al método de pago original</li>
                  <li>Se pueden emitir créditos de tienda como alternativa</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4">Productos Artesanales</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Todos nuestros productos son artesanales y hechos a mano, lo que significa:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cada pieza es única y puede tener pequeñas variaciones</li>
                  <li>Los colores pueden variar ligeramente de las imágenes</li>
                  <li>Los tiempos de producción pueden variar según la complejidad</li>
                  <li>Algunos productos pueden requerir tiempo de elaboración</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4">Propiedad Intelectual</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Todo el contenido de este sitio web, incluyendo textos, imágenes, logos y diseños, 
                  es propiedad exclusiva de Mautik y está protegido por las leyes de propiedad intelectual.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4">Limitación de Responsabilidad</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Mautik no será responsable por daños indirectos, incidentales o consecuentes 
                  que puedan resultar del uso de nuestros productos o servicios.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4">Modificaciones</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                  Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-900 mb-4">Contacto</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Si tienes preguntas sobre estos términos de servicio, contáctanos:
                </p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p><strong>Email:</strong> mautik.official@gmail.com</p>
                  <p><strong>Teléfono:</strong> +507 6778 2931</p>
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
