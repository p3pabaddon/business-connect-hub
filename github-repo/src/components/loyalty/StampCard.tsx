import { motion } from "framer-motion";
import { Check, Star, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StampCardProps {
  businessName: string;
  currentStamps: number;
  targetStamps: number;
  rewardTitle: string;
  isGuest?: boolean;
  className?: string;
}

export const StampCard = ({
  businessName,
  currentStamps,
  targetStamps,
  rewardTitle,
  isGuest = false,
  className
}: StampCardProps) => {
  const progress = isGuest ? 0 : (currentStamps / targetStamps) * 100;
  const stamps = Array.from({ length: targetStamps });

  return (
    <Card className={cn("overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-card to-accent/5", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading">{businessName}</CardTitle>
          <div className="bg-primary/20 text-primary p-2 rounded-full">
            <Gift className="w-4 h-4" />
          </div>
        </div>
        <CardDescription className="text-sm">
          {isGuest ? (
            <>Her <span className="font-bold text-primary">{targetStamps} randevuda</span> bir: <span className="font-semibold text-foreground">{rewardTitle}</span></>
          ) : (
            <>{targetStamps - currentStamps} randevu sonra: <span className="font-semibold text-foreground">{rewardTitle}</span></>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-3 mb-6">
          {stamps.map((_, i) => {
            const isFilled = i < currentStamps;
            const isNext = i === currentStamps;
            
            return (
              <motion.div
                key={i}
                initial={false}
                animate={isFilled ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : {}}
                className={cn(
                  "aspect-square rounded-full border-2 flex items-center justify-center transition-colors duration-500",
                  isFilled 
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : isNext 
                      ? "border-primary border-dashed bg-primary/5 shadow-inner" 
                      : "border-muted bg-muted/20"
                )}
              >
                {isFilled ? (
                  <Check className="w-5 h-5" />
                ) : i === targetStamps - 1 ? (
                  <Star className="w-5 h-5 text-muted-foreground/40" />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground/30">{i + 1}</span>
                )}
              </motion.div>
            );
          })}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">İlerleme</span>
            <span>%{Math.round(progress)}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </CardContent>
      <div className="bg-accent/10 px-6 py-2 border-t border-border/50 text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
        Yalnızca bu işletmede geçerlidir
      </div>
    </Card>
  );
};
