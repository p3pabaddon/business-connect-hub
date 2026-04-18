import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  iconOnly?: boolean;
  onClick?: () => void;
}

export function Logo({ className, iconOnly = false, onClick }: Props) {
  return (
    <Link to="/" onClick={onClick} className={cn("flex items-center gap-2.5 group transition-all", className)}>
      <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 rotate-1 group-hover:rotate-0 transition-transform duration-300">
        <span className="text-primary-foreground font-heading text-xl font-black">R</span>
      </div>
      {!iconOnly && (
        <span className="font-heading text-2xl text-foreground whitespace-nowrap tracking-tighter">
          <span className="font-black">Randevu</span>
          <span className="text-primary font-light">Dunyasi</span>
        </span>
      )}
    </Link>
  );
}

