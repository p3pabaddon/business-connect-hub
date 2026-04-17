import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <Loader2 className="w-12 h-12 animate-spin text-primary absolute inset-0 [animation-delay:-0.5s]" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Yukleniyor...</p>
    </div>
  );
}
