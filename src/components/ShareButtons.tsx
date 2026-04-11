import { Share2, Facebook, Twitter, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const { toast } = useToast();
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link kopyalandı!" });
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // User cancelled
      }
    }
  };

  const openShare = (base: string) => {
    window.open(base, "_blank", "width=600,height=400");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-1" /> Paylaş
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-2">
        <div className="space-y-1">
          {navigator.share && (
            <button
              onClick={shareNative}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-foreground"
            >
              <Share2 className="w-4 h-4" /> Paylaş
            </button>
          )}
          <button
            onClick={() =>
              openShare(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
              )
            }
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-foreground"
          >
            <Facebook className="w-4 h-4" /> Facebook
          </button>
          <button
            onClick={() =>
              openShare(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`
              )
            }
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-foreground"
          >
            <Twitter className="w-4 h-4" /> Twitter
          </button>
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-foreground"
          >
            <LinkIcon className="w-4 h-4" /> Link Kopyala
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
