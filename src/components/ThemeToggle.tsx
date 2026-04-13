import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      className="h-9 w-9"
      aria-label="Tema değiştir"
      title={theme === "light" ? "Açık Tema" : theme === "dark" ? "Koyu Tema" : "Sistem Teması"}
    >
      {theme === "light" && <Sun className="h-4 w-4 text-warning" />}
      {theme === "dark" && <Moon className="h-4 w-4 text-accent" />}
      {theme === "system" && <Monitor className="h-4 w-4 text-muted-foreground" />}
    </Button>
  );
}
