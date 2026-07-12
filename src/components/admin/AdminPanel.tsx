"use client";

import * as React from "react";
import {
  Settings as SettingsIcon,
  Briefcase,
  Users,
  Handshake,
  Images,
  FileText,
  Instagram,
  ClipboardList,
  Mail,
  X,
  LogOut,
  Loader2,
  CalendarDays,
  Lock,
  User,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Toaster as SonnerToaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { saveToken, clearToken, getToken } from "@/lib/admin-token";
import { SettingsTab } from "@/components/admin/tabs/SettingsTab";
import { ServicesTab } from "@/components/admin/tabs/ServicesTab";
import { TeamTab } from "@/components/admin/tabs/TeamTab";
import { PartnersTab } from "@/components/admin/tabs/PartnersTab";
import { CommercialAlliesTab } from "@/components/admin/tabs/CommercialAlliesTab";
import { HealthFairsTab } from "@/components/admin/tabs/HealthFairsTab";
import { SlidesTab } from "@/components/admin/tabs/SlidesTab";
import { PostsTab } from "@/components/admin/tabs/PostsTab";
import { InstagramTab } from "@/components/admin/tabs/InstagramTab";
import { QuotesTab } from "@/components/admin/tabs/QuotesTab";
import { ContactTab } from "@/components/admin/tabs/ContactTab";

type TabId =
  | "settings"
  | "services"
  | "team"
  | "partners"
  | "commercial-allies"
  | "health-fairs"
  | "slides"
  | "posts"
  | "instagram"
  | "quotes"
  | "contact";

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "settings", label: "Personalización", icon: SettingsIcon },
  { id: "services", label: "Servicios", icon: Briefcase },
  { id: "team", label: "Equipo", icon: Users },
  { id: "partners", label: "Aliados", icon: Handshake },
  { id: "commercial-allies", label: "Aliados Comerciales", icon: Building2 },
  { id: "health-fairs", label: "Ferias de Salud", icon: CalendarDays },
  { id: "slides", label: "Slides", icon: Images },
  { id: "posts", label: "Publicaciones", icon: FileText },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "quotes", label: "Cotizaciones", icon: ClipboardList },
  { id: "contact", label: "Mensajes", icon: Mail },
];

export function AdminPanel() {
  const [open, setOpen] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabId>("settings");
  const [mountedTabs, setMountedTabs] = React.useState<Set<TabId>>(
    new Set(["settings"])
  );

  const checkSession = React.useCallback(async () => {
    setChecking(true);
    try {
      // Send the stored token (if any) so the session check works even
      // when the cookie is blocked by the browser (iframe/preview panel).
      const token = getToken();
      const res = await fetch("/api/admin/session", {
        credentials: "include",
        headers: token ? { "x-ela-admin-token": token } : undefined,
      });
      const j = (await res.json().catch(() => ({}))) as {
        authenticated?: boolean;
      };
      setAuthed(!!j.authenticated);
    } catch {
      setAuthed(false);
    } finally {
      setChecking(false);
    }
  }, []);

  // Listen for the `open-admin` custom event dispatched by the Header.
  React.useEffect(() => {
    const handler = () => {
      setOpen(true);
      void checkSession();
    };
    window.addEventListener("open-admin", handler);
    return () => window.removeEventListener("open-admin", handler);
  }, [checkSession]);

  // Listen for session-expired events from apiMutate (when a protected
  // request returns 401). Reset to the login view so the user can re-auth.
  React.useEffect(() => {
    const handler = () => {
      setAuthed(false);
      setMountedTabs(new Set(["settings"]));
      setActiveTab("settings");
    };
    window.addEventListener("ela-session-expired", handler);
    return () => window.removeEventListener("ela-session-expired", handler);
  }, []);

  const handleTabChange = (id: TabId) => {
    setActiveTab(id);
    setMountedTabs((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
    clearToken();
    setAuthed(false);
    setActiveTab("settings");
    setMountedTabs(new Set(["settings"]));
    toast.success("Sesión cerrada");
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!open) {
    // Still mount a Sonner toaster so admin toasts render above everything
    // once the panel has been opened at least once. (Sonner is a no-op when
    // there are no toasts to show.)
    return null;
  }

  return (
    <>
      <SonnerToaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{ style: { zIndex: 200 } }}
        style={{ zIndex: 200 }}
      />
      <div
        className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Panel de administración"
      >
        <div className="fixed right-0 top-0 flex h-full w-full max-w-5xl flex-col bg-white shadow-2xl">
          {/* Top bar */}
          <div
            className="flex h-14 shrink-0 items-center justify-between px-4 text-white"
            style={{ backgroundColor: "#212121" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="grid size-8 place-items-center rounded-md text-sm font-extrabold"
                style={{ backgroundColor: "#faae0b", color: "#212121" }}
              >
                ELA
              </div>
              <span className="text-sm font-bold uppercase tracking-wide">
                Panel de Administración
              </span>
            </div>
            <button
              onClick={handleClose}
              className="grid size-9 place-items-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar panel"
            >
              <X className="size-5" />
            </button>
          </div>

          {checking ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Verificando sesión…
            </div>
          ) : !authed ? (
            <LoginView
              onSuccess={() => {
                setAuthed(true);
                setMountedTabs(new Set(["settings"]));
                setActiveTab("settings");
              }}
            />
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
              {/* Sidebar (desktop) / Top tab bar (mobile) */}
              <aside
                className="flex shrink-0 flex-col md:w-56"
                style={{ backgroundColor: "#212121" }}
              >
                <nav className="flex max-h-[40vh] gap-1 overflow-x-auto overflow-y-auto px-2 py-3 md:max-h-none md:flex-col md:overflow-y-auto">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                          "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "text-[#212121]"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        )}
                        style={
                          isActive
                            ? { backgroundColor: "#faae0b" }
                            : undefined
                        }
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="whitespace-nowrap">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
                <div className="mt-auto hidden border-t border-white/10 p-2 md:block">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="size-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </aside>

              {/* Mobile logout */}
              <div className="flex items-center justify-end border-b px-3 py-1.5 md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-[#00455e]"
                >
                  <LogOut className="mr-1.5 size-4" />
                  Cerrar Sesión
                </Button>
              </div>

              {/* Content area */}
              <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
                {/* Lazy-mount tabs: only render once they've been activated. */}
                {mountedTabs.has("settings") && (
                  <div className={activeTab === "settings" ? "" : "hidden"}>
                    <SettingsTab />
                  </div>
                )}
                {mountedTabs.has("services") && (
                  <div className={activeTab === "services" ? "" : "hidden"}>
                    <ServicesTab />
                  </div>
                )}
                {mountedTabs.has("team") && (
                  <div className={activeTab === "team" ? "" : "hidden"}>
                    <TeamTab />
                  </div>
                )}
                {mountedTabs.has("partners") && (
                  <div className={activeTab === "partners" ? "" : "hidden"}>
                    <PartnersTab />
                  </div>
                )}
                {mountedTabs.has("commercial-allies") && (
                  <div className={activeTab === "commercial-allies" ? "" : "hidden"}>
                    <CommercialAlliesTab />
                  </div>
                )}
                {mountedTabs.has("health-fairs") && (
                  <div className={activeTab === "health-fairs" ? "" : "hidden"}>
                    <HealthFairsTab />
                  </div>
                )}
                {mountedTabs.has("slides") && (
                  <div className={activeTab === "slides" ? "" : "hidden"}>
                    <SlidesTab />
                  </div>
                )}
                {mountedTabs.has("posts") && (
                  <div className={activeTab === "posts" ? "" : "hidden"}>
                    <PostsTab />
                  </div>
                )}
                {mountedTabs.has("instagram") && (
                  <div className={activeTab === "instagram" ? "" : "hidden"}>
                    <InstagramTab
                      onGoToSettings={() => handleTabChange("settings")}
                    />
                  </div>
                )}
                {mountedTabs.has("quotes") && (
                  <div className={activeTab === "quotes" ? "" : "hidden"}>
                    <QuotesTab />
                  </div>
                )}
                {mountedTabs.has("contact") && (
                  <div className={activeTab === "contact" ? "" : "hidden"}>
                    <ContactTab />
                  </div>
                )}
              </main>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/** Login form shown when the user opens the admin panel unauthenticated. */
function LoginView({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = React.useState("admin");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        data?: { token?: string };
      };
      if (!res.ok || !j.success) {
        throw new Error(j.error || "Credenciales inválidas");
      }
      // Save the token to localStorage so it works in iframe/preview contexts
      // where third-party cookies are blocked by the browser.
      if (j.data?.token) {
        saveToken(j.data.token);
      }
      toast.success("Bienvenido al panel de administración");
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto bg-gradient-to-br from-[#212121] to-[#00455e] p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div
            className="mb-3 grid size-14 place-items-center rounded-lg text-xl font-extrabold"
            style={{ backgroundColor: "#faae0b", color: "#212121" }}
          >
            ELA
          </div>
          <h1 className="text-xl font-bold text-[#212121]">
            Panel de Administración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión para gestionar el contenido del sitio.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-user" className="text-xs font-semibold">
              Usuario
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-9"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="admin-pass" className="text-xs font-semibold">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                autoComplete="current-password"
                required
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00455e] py-2.5 text-white hover:bg-[#004a70]"
          >
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 size-4" />
            )}
            Iniciar sesión
          </Button>
        </form>

        <div className="mt-5 rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 px-3 py-2 text-center text-[11px] text-muted-foreground">
          <span className="font-semibold">Credenciales por defecto:</span> admin
          / ela-admin-2024
        </div>
      </div>
    </div>
  );
}
