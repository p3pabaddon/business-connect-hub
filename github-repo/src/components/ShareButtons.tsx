import { Share2, Link as LinkIcon, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export const ShareButtons = ({ url, title }: ShareButtonsProps) => {
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Baglanti kopyalandi",
      description: "Paylasmaya hazirsiniz!",
    });
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`, "_blank");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Paylas
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2"
            onClick={handleCopyLink}
          >
            <LinkIcon className="w-4 h-4" />
            Baglantiyi Kopyala
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2"
            onClick={shareOnWhatsApp}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
