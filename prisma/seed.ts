/**
 * Prisma seed for Seguros y Fianzas ELA.
 * Run with: bun prisma/seed.ts
 *
 * Idempotent: upserts the singleton SiteSettings and Admin, and only seeds
 * the other tables when they are empty.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ela-admin-2024'

/** Build a simple SVG logo as a data URI for an insurance brand. */
function brandLogo(name: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80" width="220" height="80"><rect width="220" height="80" fill="#ffffff"/><text x="110" y="48" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700" text-anchor="middle" fill="${color}">${name}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

async function main() {
  // 1. SiteSettings singleton (upsert).
  await db.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      brandName: 'Seguros y Fianzas ELA',
      tagline: 'Brindamos Servicios de Seguros y Fianzas',
      logoText: 'ELA',
      primaryColor: '#00455e',
      secondaryColor: '#23a1ea',
      accentColor: '#faae0b',
      darkColor: '#212121',
      phone: '66-3206-4190',
      email: 'contacto@segurosela.com',
      address: 'Calle Buenaventura #374, Fracc. Chapultepec, Tijuana, B.C., CP 22020',
      schedule: 'Lun - Vier: 09:00 - 18:00',
      yearsExperience: 10,
      aboutText:
        'Constituida como una empresa 100% Mexicana, contamos con mas de 10 años de trayectoria.',
      instagramUser: 'segurosela',
      instagramUrl: 'https://www.instagram.com/segurosela/',
    },
  })
  console.log('SiteSettings listo.')

  // 2. Admin user (upsert).
  await db.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: {},
    create: {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      name: 'Administrador',
    },
  })
  console.log('Admin listo.')

  // 3. Services — only if empty.
  const servicesCount = await db.service.count()
  if (servicesCount === 0) {
    await db.service.createMany({
      data: [
        {
          slug: 'seguro-personal',
          title: 'Seguro Personal',
          shortDesc:
            'Protege lo que más amas: tu vida, tu familia, tu hogar y tu auto.',
          description:
            'En Seguros y Fianzas ELA sabemos que tu familia y tu patrimonio son lo más importante. Ofrecemos seguros de vida, gastos médicos mayores, seguros de hogar y auto, diseñados a la medida de tus necesidades. Nuestro equipo de asesores te acompaña en cada etapa de la vida para garantizar la tranquilidad de quienes más quieres. Contamos con las mejores aseguradoras de México y planes flexibles que se adaptan a tu presupuesto. ¡Cotiza hoy y protege tu futuro!',
          icon: 'user',
          order: 1,
          active: true,
        },
        {
          slug: 'seguro-empresarial',
          title: 'Seguro Empresarial',
          shortDesc:
            'Respalda el crecimiento de tu empresa con coberturas a la medida.',
          description:
            'Protegemos la operación de tu negocio con coberturas integrales para empresas de cualquier tamaño: daños materiales, responsabilidad civil, equipos electrónicos, transporte de mercancías y más. Diseñamos pólizas a la medida de tu industria, ya sea comercio, manufactura, servicios o construcción. Nuestros asesores especializados analizan los riesgos de tu empresa y te ofrecen las mejores opciones del mercado. Mantén tu negocio creciendo con la tranquilidad de estar protegido ante cualquier imprevisto.',
          icon: 'briefcase',
          order: 2,
          active: true,
        },
        {
          slug: 'fianzas',
          title: 'Fianzas',
          shortDesc:
            'Garantías y respaldo para cumplir con tus obligaciones legales y contractuales.',
          description:
            'Tramitamos todo tipo de fianzas: judiciales, administrativas, de fidelidad, de contrato y de anticipo. Nuestro equipo te asesora en todo el proceso para que cumplas con tus obligaciones legales y contractuales de manera rápida y segura. Atendemos particulares, empresas y dependencias de gobierno en Tijuana y todo Baja California. Contamos con afianzadoras autorizadas por la Secretaría de Hacienda y Crédito Público. Obtén tu fianza en el menor tiempo posible y con las mejores condiciones.',
          icon: 'shield',
          order: 3,
          active: true,
        },
      ],
    })
    console.log('Servicios creados.')
  } else {
    console.log(`Servicios ya existen (${servicesCount}). Skip.`)
  }

  // 4. Team members — only if empty.
  const teamCount = await db.teamMember.count()
  if (teamCount === 0) {
    const teamData = [
      {
        name: 'Lara Garrison',
        role: 'Agente de Seguros de Vida',
        imageUrl: '/images/team/team-1.png',
        order: 1,
      },
      {
        name: "Elliot O'donell",
        role: 'Asesor de Seguros de Salud',
        imageUrl: '/images/team/team-2.png',
        order: 2,
      },
      {
        name: 'Austin Cruz',
        role: 'Agente de Seguros de Vida',
        imageUrl: '/images/team/team-3.png',
        order: 3,
      },
      {
        name: 'Hanna Mcintyre',
        role: 'Agente de Seguros de Auto',
        imageUrl: '/images/team/team-4.png',
        order: 4,
      },
    ]
    await db.teamMember.createMany({
      data: teamData.map((t) => ({ ...t, active: true })),
    })
    console.log('Equipo creado.')
  } else {
    console.log(`Equipo ya existe (${teamCount}). Skip.`)
  }

  // 5. Partners — only if empty.
  const partnersCount = await db.partner.count()
  if (partnersCount === 0) {
    const partnersData = [
      { name: 'GNP', color: '#E30613', order: 1 },
      { name: 'MetLife', color: '#005A8B', order: 2 },
      { name: 'AXA', color: '#00008F', order: 3 },
      { name: 'Atlas', color: '#C8102E', order: 4 },
      { name: 'HDI', color: '#FF6600', order: 5 },
      { name: 'Allianz', color: '#003781', order: 6 },
    ]
    await db.partner.createMany({
      data: partnersData.map((p) => ({
        name: p.name,
        logoUrl: brandLogo(p.name, p.color),
        order: p.order,
        active: true,
      })),
    })
    console.log('Aliados creados.')
  } else {
    console.log(`Aliados ya existen (${partnersCount}). Skip.`)
  }

  // 6. Slides — only if empty.
  const slidesCount = await db.slide.count()
  if (slidesCount === 0) {
    const slidesData = [
      {
        title: 'Seguro de vida para tu familia',
        subtitle: 'Planifica para el futuro y vive tu vida ahora',
        imageUrl: '/images/hero/hero-family.png',
        buttonText: 'Saber Más',
        buttonLink: '#cotizacion',
        order: 1,
      },
      {
        title: 'Asegura tu Empresa',
        subtitle: 'Estás en buenas manos con Seguros ELA',
        imageUrl: '/images/hero/hero-business.png',
        buttonText: 'Saber Más',
        buttonLink: '#cotizacion',
        order: 2,
      },
      {
        title: 'Fianzas',
        subtitle: 'Ayudando a su plan para mañana ... hoy',
        imageUrl: '/images/hero/hero-bonds.png',
        buttonText: 'Saber Más',
        buttonLink: '#cotizacion',
        order: 3,
      },
    ]
    await db.slide.createMany({
      data: slidesData.map((s) => ({ ...s, active: true })),
    })
    console.log('Slides creados.')
  } else {
    console.log(`Slides ya existen (${slidesCount}). Skip.`)
  }

  // 7. Posts — only if empty.
  const postsCount = await db.post.count()
  if (postsCount === 0) {
    const createdDate = new Date('2021-12-27T10:00:00.000Z')
    const postsData = [
      {
        title: 'Propósitos de año nuevo',
        slug: 'propositos-de-ano-nuevo',
        excerpt:
          'El inicio de un nuevo año es el momento perfecto para revisar tus metas financieras y proteger lo que más valoras. Un seguro bien planeado es parte esencial de tus propósitos.',
        content:
          'Cada inicio de año miles de personas se proponen alcanzar nuevas metas: mejorar su salud, ahorrar más, viajar o invertir. Sin embargo, pocas veces se incluye dentro de esos propósitos la protección del patrimonio familiar.\n\nContar con un seguro de vida, de gastos médicos mayores o de hogar adecuado no es un gasto, es una inversión en tranquilidad. Un imprevisto puede derrumbar en semanas los ahorros de toda una vida, mientras que una póliza bien estructurada amortigua el golpe y permite a tu familia mantener su estilo de vida.\n\nEn Seguros y Fianzas ELA te ayudamos a revisar tus coberturas actuales y a diseñar un plan a la medida de tus propósitos de este año. Agenda una cita y empieza el año con la tranquilidad de estar bien protegido.',
        imageUrl: '/images/blog/blog-3.png',
        category: 'Nuestras Publicaciones',
        createdAt: createdDate,
      },
      {
        title: '¿Cuáles son los síntomas del Omicron?',
        slug: 'cuales-son-los-sintomas-del-omicron',
        excerpt:
          'Conoce los principales síntomas de la variante Omicron y por qué es importante contar con un seguro de gastos médicos mayores para hacer frente a cualquier imprevisto de salud.',
        content:
          'La variante Omicron del COVID-19 se ha caracterizado por presentar síntomas diferentes a las cepas anteriores. Entre los más comunes se encuentran: dolor de garganta, fatiga, dolor de cabeza, fiebre leve, secreción nasal y tos. En algunos casos también se presentan dolores musculares y pérdida del gusto u olfato, aunque con menor frecuencia que en variantes previas.\n\nAunque en muchas personas los síntomas son leves, en grupos vulnerables puede requerir hospitalización y tratamientos costosos. Por eso es fundamental mantenerse informado y, sobre todo, contar con un seguro de gastos médicos mayores que respalde a tu familia ante cualquier eventualidad.\n\nEn Seguros y Fianzas ELA te asesoramos para encontrar la póliza de salud ideal según tus necesidades y las de tu familia. La prevención y la protección van de la mano: cuida tu salud hoy y asegura tu tranquilidad para mañana.',
        imageUrl: '/images/blog/blog-2.png',
        category: 'Nuestras Publicaciones',
        createdAt: createdDate,
      },
      {
        title: '¿Para qué sirve un seguro de vida?',
        slug: 'para-que-sirve-un-seguro-de-vida',
        excerpt:
          'Un seguro de vida es una herramienta financiera que protege a tu familia ante tu ausencia, garantizando su estabilidad económica y el cumplimiento de sus proyectos.',
        content:
          'Muchas personas piensan que un seguro de vida es innecesario o solo para personas mayores, pero la realidad es muy distinta. Un seguro de vida sirve para garantizar que, ante tu ausencia repentina, tu familia cuente con los recursos económicos necesarios para mantener su nivel de vida, pagar la educación de los hijos, liquidar deudas (incluyendo la hipoteca) y cubrir gastos funerarios.\n\nExisten diferentes tipos de seguro de vida: temporal, whole life (vida entera), universal y dotal. Cada uno se adapta a etapas distintas de tu vida. Un asesor profesional te ayudará a determinar el monto adecuado de cobertura, considerando tus ingresos, deudas y el número de personas que dependen de ti.\n\nEn Seguros y Fianzas ELA contamos con más de 10 años de experiencia ayudando a familias de Tijuana y Baja California a proteger su futuro. Cotiza hoy tu seguro de vida y dales a los que más amas la tranquilidad de saber que siempre estarán respaldados.',
        imageUrl: '/images/blog/blog-1.png',
        category: 'Nuestras Publicaciones',
        createdAt: createdDate,
      },
    ]
    for (const p of postsData) {
      await db.post.create({ data: p })
    }
    console.log('Posts creados.')
  } else {
    console.log(`Posts ya existen (${postsCount}). Skip.`)
  }

  // 8. Instagram posts — only if empty.
  const igCount = await db.instagramPost.count()
  if (igCount === 0) {
    const igData = [
      {
        permalink: 'https://www.instagram.com/segurosela/',
        imageUrl: '/images/instagram/ig-1.png',
        caption: 'Protege lo que más amas 💙 #SegurosELA #ProtecciónFamiliar',
        likes: 24,
        comments: 3,
        order: 1,
      },
      {
        permalink: 'https://www.instagram.com/segurosela/',
        imageUrl: '/images/instagram/ig-2.png',
        caption: 'Tu tranquilidad es nuestra prioridad 🛡️ #SegurosELA #SeguroDeVida',
        likes: 56,
        comments: 8,
        order: 2,
      },
      {
        permalink: 'https://www.instagram.com/segurosela/',
        imageUrl: '/images/instagram/ig-3.png',
        caption: 'Cuida tu negocio, cuida tu futuro 🏢 #SeguroEmpresarial #Tijuana',
        likes: 31,
        comments: 5,
        order: 3,
      },
      {
        permalink: 'https://www.instagram.com/segurosela/',
        imageUrl: '/images/instagram/ig-4.png',
        caption: 'Más de 10 años protegiendo a las familias mexicanas 🇲🇽 #ELA',
        likes: 89,
        comments: 14,
        order: 4,
      },
      {
        permalink: 'https://www.instagram.com/segurosela/',
        imageUrl: '/images/instagram/ig-5.png',
        caption: 'Las mejores aseguradoras en un solo lugar 🤝 #GNP #MetLife #AXA',
        likes: 42,
        comments: 6,
        order: 5,
      },
      {
        permalink: 'https://www.instagram.com/segurosela/',
        imageUrl: '/images/instagram/ig-6.png',
        caption: 'Cotiza tu seguro hoy mismo 📞 66-3206-4190 #SegurosELA #Cotización',
        likes: 67,
        comments: 9,
        order: 6,
      },
    ]
    await db.instagramPost.createMany({
      data: igData.map((p) => ({ ...p, active: true })),
    })
    console.log('Instagram posts creados.')
  } else {
    console.log(`Instagram posts ya existen (${igCount}). Skip.`)
  }

  console.log('Seed completado.')
}

main()
  .catch((e) => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
