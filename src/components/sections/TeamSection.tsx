"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Linkedin, Facebook } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import type { TeamMember } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const FALLBACK_TEAM: TeamMember[] = [
  {
    id: "t1",
    name: "Elsa Aguilar",
    role: "Directora General",
    bio: "Fundadora de Seguros y Fianzas ELA con más de 15 años de experiencia en el sector asegurador mexicano.",
    imageUrl: "/images/team/team-1.png",
    email: "contacto@segurosela.com",
    phone: "66-3206-4190",
    order: 0,
    active: true,
  },
  {
    id: "t2",
    name: "Carlos Mendez",
    role: "Asesor Empresarial",
    bio: "Especialista en seguros corporativos y gestión de riesgos para PyMEs y grandes empresas.",
    imageUrl: "/images/team/team-2.png",
    email: "contacto@segurosela.com",
    phone: "66-3206-4190",
    order: 1,
    active: true,
  },
  {
    id: "t3",
    name: "Laura Ramirez",
    role: "Especialista en Fianzas",
    bio: "Gestiona trámites de fianzas judiciales y administrativas con las principales afianzadoras del país.",
    imageUrl: "/images/team/team-3.png",
    email: "contacto@segurosela.com",
    phone: "66-3206-4190",
    order: 2,
    active: true,
  },
  {
    id: "t4",
    name: "Jorge Torres",
    role: "Asesor Personal",
    bio: "Asesora a familias y particulares en seguros de vida, salud, auto y patrimonio.",
    imageUrl: "/images/team/team-4.png",
    email: "contacto@segurosela.com",
    phone: "66-3206-4190",
    order: 3,
    active: true,
  },
];

export function TeamSection() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher<TeamMember[]>("/api/team")
      .then((data) => {
        const list = (data ?? [])
          .filter((m) => m.active)
          .sort((a, b) => a.order - b.order);
        setTeam(list.length > 0 ? list : FALLBACK_TEAM);
      })
      .catch(() => setTeam(FALLBACK_TEAM))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="equipo" aria-labelledby="team-heading" className="w-full bg-white py-20 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#00455e]">
            Profesionales
          </span>
          <h2 id="team-heading" className="mt-2 text-3xl font-extrabold text-[#212121] sm:text-4xl">
            Nuestro Equipo
          </h2>
          <div
            className="mx-auto mt-4 h-1.5 w-24 rounded-full"
            style={{ backgroundColor: "#faae0b" }}
          />
          <p className="mt-4 text-base text-slate-600">
            Un equipo de especialistas listos para asesorarte y encontrar la mejor
            cobertura para ti.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.slice(0, 4).map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden">
                  <img
                    src={member.imageUrl || "/images/team/team-1.png"}
                    alt={`Foto de ${member.name}, ${member.role} en Seguros ELA`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(10,46,63,0) 0%, rgba(10,46,63,0.85) 100%)",
                    }}
                  >
                    {member.bio && (
                      <p className="text-xs leading-relaxed text-white/90">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
                {/* Info */}
                <div className="flex flex-col items-center gap-1 px-4 pb-5 pt-4 text-center">
                  <h3 className="text-lg font-bold text-[#212121]">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#00455e]">
                    {member.role}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        aria-label={`Email de ${member.name}`}
                        className="grid size-8 place-items-center rounded-full text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: "#00455e" }}
                      >
                        <Mail className="size-4" />
                      </a>
                    )}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone.replace(/[^0-9+]/g, "")}`}
                        aria-label={`Teléfono de ${member.name}`}
                        className="grid size-8 place-items-center rounded-full text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: "#faae0b" }}
                      >
                        <Phone className="size-4" />
                      </a>
                    )}
                    <span
                      className="grid size-8 place-items-center rounded-full text-white"
                      style={{ backgroundColor: "#23a1ea" }}
                      aria-hidden
                    >
                      <Linkedin className="size-4" />
                    </span>
                    <span
                      className="grid size-8 place-items-center rounded-full text-white"
                      style={{ backgroundColor: "#212121" }}
                      aria-hidden
                    >
                      <Facebook className="size-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TeamSection;
