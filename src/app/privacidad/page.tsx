import type { Metadata } from "next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
  description:
    "Aviso de Privacidad de Seguros y Fianzas ELA. Conoce cómo recabamos, usamos y protegemos tus datos personales conforme a la LFPDPPP.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8 sm:py-20">
          {/* Header */}
          <div className="mb-10 border-b pb-6" style={{ borderColor: "#e7e7ea" }}>
            <span className="text-xs font-bold uppercase tracking-widest text-[#00455e]">
              Legal
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-[#212121] sm:text-4xl">
              Aviso de Privacidad
            </h1>
            <div
              className="mt-4 h-1.5 w-24 rounded-full"
              style={{ backgroundColor: "#faae0b" }}
            />
            <p className="mt-4 text-sm text-slate-600">
              Seguros y Fianzas ELA — Última actualización: enero 2025
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p className="rounded-lg border-l-4 bg-slate-50 p-4" style={{ borderLeftColor: "#00455e" }}>
              El Derecho a la debida protección de datos personales es un Derecho
              Humano previsto en los Artículos Sexto y Décimo Sexto de la
              Constitución Política de los Estados Unidos Mexicanos. Es por lo
              anterior que ponemos a disposición del Titular de los Datos
              Personales el presente Aviso de Privacidad.
            </p>

            {/* Section 1 */}
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#00455e]">
                1. ¿Quién es el responsable del uso y manejo de mis datos personales?
              </h2>
              <p>
                El responsable de la recaudación, uso, manejo y transferencia de
                sus datos personales y sensibles es{" "}
                <strong>ELA SEGUROS Y FIANZAS S.A. DE C.V.</strong>, en adelante
                &ldquo;ELA SEGUROS&rdquo; o &ldquo;EL RESPONSABLE&rdquo;.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#00455e]">
                2. Domicilio para notificaciones
              </h2>
              <p>
                El domicilio que ELA SEGUROS señala para oír y recibir toda clase
                de notificaciones relacionadas a temas de protección de Datos
                Personales es:
              </p>
              <p className="mt-2 font-semibold">
                Calle Buenaventura #374, Fracc. Chapultepec, Tijuana, Baja
                California, C.P. 22020.
              </p>
              <p className="mt-2">
                Asimismo, puede contactarnos a través de los siguientes medios:
              </p>
              <ul className="mt-2 list-disc pl-6">
                <li>Teléfono: <strong>66-3206-4190</strong></li>
                <li>Correo electrónico: <strong>contacto@segurosela.com</strong></li>
                <li>Sitio web: <strong>www.segurosela.com.mx</strong></li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#00455e]">
                3. Medios por los cuales ELA SEGUROS puede recaudar sus datos
                personales
              </h2>
              <p>
                Para que ELA SEGUROS pueda proporcionarle el debido servicio y
                asesoría que usted requiere, es necesario que obtenga cierta
                información personal y sensible suya. La recolección de sus datos
                personales y sensibles se puede llevar a cabo a través de:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>
                  Solicitudes, encuestas y formatos en medios físicos y/o
                  electrónicos, incluyendo las solicitudes que las propias
                  compañías aseguradoras y/o afianzadoras requieren.
                </li>
                <li>
                  Llamadas telefónicas, video llamadas, grabaciones y/o
                  aplicaciones móviles directamente con usted o con el tercero
                  interesado.
                </li>
                <li>
                  Videocámaras instaladas en las ubicaciones donde ELA SEGUROS
                  presta sus servicios al público en general.
                </li>
                <li>
                  Correos electrónicos en los cuales usted y/o el Tercero
                  Interesado proporcione la información requerida para la correcta
                  apreciación del riesgo.
                </li>
                <li>
                  Redes sociales, ya sea por mensaje directo o mediante los
                  formularios de contacto implementados por cada red social.
                </li>
                <li>
                  Página(s) web de su propiedad en las cuales usted proporcione
                  información confidencial y personal.
                </li>
                <li>
                  Formularios de contacto y cotización disponibles en este sitio
                  web.
                </li>
              </ul>
              <p className="mt-3">
                Es importante mencionar que si usted proporciona a ELA SEGUROS
                información de terceras personas, de manera implícita acepta contar
                con el consentimiento de estas, liberando a ELA SEGUROS de toda
                implicación legal y contractual.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#00455e]">
                4. Finalidades del tratamiento de sus datos personales
              </h2>
              <p>
                Sus datos personales serán utilizados para las siguientes
                finalidades principales:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>Identificación y verificación de identidad del Titular.</li>
                <li>
                  Prestación de los servicios de seguros y fianzas solicitados.
                </li>
                <li>
                  Contacto para dar seguimiento a cotizaciones, solicitudes y
                  trámites.
                </li>
                <li>
                  Cumplimiento de obligaciones contractuales con aseguradoras y
                  afianzadoras.
                </li>
                <li>
                  Evaluación de riesgo y emisión de pólizas de seguro y fianzas.
                </li>
                <li>Atención y resolución de siniestros y reclamaciones.</li>
                <li>
                  Cumplimiento de obligaciones legales y regulatorias ante
                  autoridades competentes.
                </li>
              </ul>
              <p className="mt-3">
                Adicionalmente, sus datos podrán ser utilizados para las
                siguientes finalidades secundarias, las cuales no son necesarias
                para el servicio solicitado pero nos permiten ofrecerle una mejor
                experiencia:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>Envío de información promocional y comercial.</li>
                <li>Encuestas de satisfacción del servicio.</li>
                <li>
                  Oferta de productos y servicios complementarios de seguros y
                  fianzas.
                </li>
              </ul>
              <p className="mt-3">
                En caso de que no desee que sus datos personales se utilicen para
                estas finalidades secundarias, puede manifestarlo enviando un
                correo a <strong>contacto@segurosela.com</strong>.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#00455e]">
                5. Datos personales que se recaban
              </h2>
              <p>
                Para las finalidades señaladas, ELA SEGUROS puede recabar los
                siguientes datos personales:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>
                  <strong>Identificación:</strong> nombre completo, fecha de
                  nacimiento, edad, sexo, RFC, CURP.
                </li>
                <li>
                  <strong>Contacto:</strong> domicilio, teléfono, correo
                  electrónico.
                </li>
                <li>
                  <strong>Financieros:</strong> información sobre ingresos,
                  historial crediticio, datos bancarios para cobro de primas.
                </li>
                <li>
                  <strong>Datos sensibles:</strong> estado de salud, historial
                  médico, estilo de vida, hábitos (fumador, bebedor), necesario
                  para la evaluación de riesgo en seguros de vida y gastos médicos.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#00455e]">
                6. Transferencias de datos personales
              </h2>
              <p>
                ELA SEGUROS podrá transferir sus datos personales a las siguientes
                personas y entidades, sin requerir su consentimiento conforme a la
                Ley Federal de Protección de Datos Personales en Posesión de los
                Particulares (LFPDPPP):
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>
                  Compañías aseguradoras y afianzadoras con las que se celebren
                  contratos de seguro o fianza.
                </li>
                <li>Autoridades competentes para cumplimiento legal.</li>
                <li>
                  Proveedores de servicios necesarios para la operación (cómputo,
                  almacenamiento, cobranza).
                </li>
              </ul>
              <p className="mt-3">
                Las transferencias se realizarán bajo los más altos estándares de
                seguridad y confidencialidad, y los receptores asumirán las mismas
                obligaciones de protección de datos que ELA SEGUROS.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#00455e]">
                7. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
              </h2>
              <p>
                Usted tiene derecho de acceder a sus datos personales que poseemos
                y a los detalles del tratamiento de los mismos, así como a
                rectificarlos en caso de ser inexactos o incompletos; cancelarlos
                cuando considere que no son necesarios para alguna de las
                finalidades señaladas o estar siendo utilizados para finalidades no
                consentidas; oponerse al tratamiento de los mismos para fines
                específicos.
              </p>
              <p className="mt-3">
                Para el ejercicio de cualquiera de los derechos ARCO, deberá
                presentar la solicitud respectiva a través de:
              </p>
              <ul className="mt-2 list-disc pl-6">
                <li>
                  Correo electrónico: <strong>contacto@segurosela.com</strong>
                </li>
                <li>
                  Teléfono: <strong>66-3206-4190</strong>
                </li>
                <li>
                  Domicilio: Calle Buenaventura #374, Fracc. Chapultepec, Tijuana,
                  Baja California, C.P. 22020.
                </li>
              </ul>
              <p className="mt-3">
                Su solicitud deberá contener: nombre y domicilio u otro medio para
                recibir comunicaciones, documentos que acrediten su identidad,
                descripción clara y precisa de los datos personales respecto de los
                que ejercerá los derechos, y cualquier otro elemento que facilite
                la localización de los datos.
              </p>
              <p className="mt-3">
                ELA SEGUROS responderá a su solicitud en un plazo máximo de 20 días
                hábiles contados desde la recepción de la misma.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#00455e]">
                8. Medidas de seguridad
              </h2>
              <p>
                ELA SEGUROS mantiene medidas de seguridad técnicas, administrativas
                y físicas para proteger sus datos personales contra daño, pérdida,
                alteración, destrucción o uso no autorizado, de conformidad con los
                principios de protección de datos establecidos en la LFPDPPP.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#00455e]">
                9. Modificaciones al aviso de privacidad
              </h2>
              <p>
                ELA SEGUROS se reserva el derecho de efectuar en cualquier momento
                modificaciones o actualizaciones al presente aviso de privacidad,
                para la atención de novedades legislativas, políticas internas o
                nuevos requerimientos para la prestación de servicios.
              </p>
              <p className="mt-3">
                Estas modificaciones estarán disponibles para el público a través de
                nuestro sitio web: <strong>www.segurosela.com.mx/privacidad</strong>.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#00455e]">
                10. Consentimiento
              </h2>
              <p>
                Al proporcionar sus datos personales a través de cualquiera de los
                medios señalados, así como al marcar la casilla de aceptación en
                los formularios de contacto y cotización de este sitio web, usted
                manifiesta haber leído y aceptado el presente aviso de privacidad,
                consintiendo el tratamiento de sus datos personales en los términos
                aquí descritos.
              </p>
            </section>

            {/* Contact */}
            <div
              className="mt-10 rounded-xl p-6 text-white"
              style={{ backgroundColor: "#00455e" }}
            >
              <h3 className="mb-2 text-lg font-bold">
                ¿Tienes dudas sobre tu privacidad?
              </h3>
              <p className="text-sm text-white/90">
                Contáctanos y con gusto resolveremos cualquier inquietud sobre el
                manejo de tus datos personales.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <a
                  href="tel:6632064190"
                  className="font-semibold transition-colors hover:text-[#faae0b]"
                >
                  📞 66-3206-4190
                </a>
                <a
                  href="mailto:contacto@segurosela.com"
                  className="font-semibold transition-colors hover:text-[#faae0b]"
                >
                  ✉️ contacto@segurosela.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
