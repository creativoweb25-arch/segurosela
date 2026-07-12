import { Resend } from "resend";

// Lazy initialization — only create the Resend client when actually needed
// This prevents errors during build when RESEND_API_KEY is not set
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "");
  }
  return _resend;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Seguros ELA <noreply@segurosela.com.mx>";
const TO_EMAIL =
  process.env.CONTACT_EMAIL || "contacto@segurosela.com.mx";

interface QuoteEmailData {
  name: string;
  email: string;
  phone: string;
  insuranceType: string;
  protectionLevel?: string | null;
  message?: string | null;
}

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}

function getEmailFooter() {
  return `
    <tr>
      <td style="padding:24px 40px;background-color:#001e3d;border-radius:0 0 8px 8px;">
        <p style="margin:0;color:#ffffff;font-size:14px;font-weight:bold;">Seguros y Fianzas ELA</p>
        <p style="margin:4px 0 0;color:#ffffff;opacity:0.7;font-size:12px;">Empresa 100% Mexicana con más de 10 años de trayectoria</p>
        <p style="margin:8px 0 0;color:#faae0b;font-size:12px;">📞 66-3206-4190 · ✉️ contacto@segurosela.com</p>
        <p style="margin:4px 0 0;color:#ffffff;opacity:0.5;font-size:11px;">Calle Buenaventura #374, Fracc. Chapultepec, Tijuana, B.C., CP 22020</p>
      </td>
    </tr>
  `;
}

function getEmailWrapper(content: string, title: string) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="padding:24px 40px;background-color:#00455e;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">${title}</h1>
              <p style="margin:6px 0 0;color:#faae0b;font-size:13px;">Has recibido una nueva solicitud desde tu sitio web</p>
            </td>
          </tr>
          ${content}
          ${getEmailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function quoteEmailHtml(data: QuoteEmailData) {
  const rows = [
    { label: "Nombre", value: data.name },
    { label: "Correo electrónico", value: data.email },
    { label: "Teléfono", value: data.phone },
    { label: "Tipo de seguro", value: data.insuranceType },
    { label: "Nivel de protección", value: data.protectionLevel || "—" },
    { label: "Mensaje", value: data.message || "—" },
  ];

  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e7e7ea;">
          <strong style="color:#00455e;font-size:14px;">${r.label}:</strong>
          <span style="color:#212121;font-size:14px;margin-left:8px;">${r.value}</span>
        </td>
      </tr>
    `
    )
    .join("");

  const content = `
    <tr>
      <td style="padding:24px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${rowsHtml}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 24px;">
        <a href="mailto:${data.email}" style="display:inline-block;background-color:#faae0b;color:#212121;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold;">Responder a ${data.name}</a>
      </td>
    </tr>
  `;

  return getEmailWrapper(content, "Nueva Solicitud de Cotización");
}

function contactEmailHtml(data: ContactEmailData) {
  const rows = [
    { label: "Nombre", value: data.name },
    { label: "Correo electrónico", value: data.email },
    { label: "Teléfono", value: data.phone || "—" },
    { label: "Asunto", value: data.subject || "—" },
  ];

  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e7e7ea;">
          <strong style="color:#00455e;font-size:14px;">${r.label}:</strong>
          <span style="color:#212121;font-size:14px;margin-left:8px;">${r.value}</span>
        </td>
      </tr>
    `
    )
    .join("");

  const content = `
    <tr>
      <td style="padding:24px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${rowsHtml}
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid #e7e7ea;">
              <strong style="color:#00455e;font-size:14px;display:block;margin-bottom:6px;">Mensaje:</strong>
              <span style="color:#212121;font-size:14px;line-height:1.6;">${data.message}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 24px;">
        <a href="mailto:${data.email}" style="display:inline-block;background-color:#faae0b;color:#212121;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold;">Responder a ${data.name}</a>
      </td>
    </tr>
  `;

  return getEmailWrapper(content, "Nuevo Mensaje de Contacto");
}

/** Send a quote request email notification */
export async function sendQuoteEmail(data: QuoteEmailData): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Nueva cotización: ${data.insuranceType} - ${data.name}`,
      html: quoteEmailHtml(data),
      replyTo: data.email,
    });

    if (error) {
      console.error("Error sending quote email:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Quote email exception:", e);
    return false;
  }
}

/** Send a contact message email notification */
export async function sendContactEmail(data: ContactEmailData): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: data.subject
        ? `${data.subject} - ${data.name}`
        : `Nuevo mensaje de ${data.name}`,
      html: contactEmailHtml(data),
      replyTo: data.email,
    });

    if (error) {
      console.error("Error sending contact email:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Contact email exception:", e);
    return false;
  }
}
