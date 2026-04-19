import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Search,
  LayoutDashboard,
  Store,
  Home,
  Settings,
  User,
  HelpCircle,
  FileText,
  Map,
  PlusCircle,
} from "lucide-react";
import { t } from "@/lib/translations";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border border-border rounded-lg transition-all"
      >
        <Search className="w-4 h-4" />
        <span>{t("common.search_command") || "Ara..."}</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 ml-12">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("common.type_command") || "Bir komut yazın veya arama yapın..."} />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading={t("common.navigation") || "Navigasyon"}>
            <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
              <Home className="mr-2 h-4 w-4" />
              <span>{t("nav.home")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/isletmeler"))}>
              <Store className="mr-2 h-4 w-4" />
              <span>{t("nav.businesses")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/harita"))}>
              <Map className="mr-2 h-4 w-4" />
              <span>{t("nav.map")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/blog"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>{t("nav.blog")}</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t("common.actions") || "Aksiyonlar"}>
            <CommandItem onSelect={() => runCommand(() => navigate("/isletme-basvuru"))}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>{t("nav.for_businesses")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/profil"))}>
              <User className="mr-2 h-4 w-4" />
              <span>{t("nav.profile")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/sss"))}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>{t("nav.faq")}</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t("common.settings") || "Ayarlar"}>
            <CommandItem onSelect={() => runCommand(() => {})}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{t("common.settings")}</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
