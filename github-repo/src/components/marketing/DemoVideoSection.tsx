import { useRef, useState } from "react";
import { Play, Pause, CheckCircle } from "lucide-react";
import { t } from "@/lib/translations";
import { ScrollReveal } from "@/hooks/useScrollReveal";
import demoVideoAsset from "@/assets/demo-video.mp4.asset.json";

export function DemoVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface/50 to-background" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-accent bg-accent/10 px-4 py-1.5 rounded-full mb-4">
              {t("demo.label")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading text-foreground mb-4">
              {t("demo.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t("demo.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="max-w-4xl mx-auto">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-border group cursor-pointer"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src={demoVideoAsset.url}
                className="w-full aspect-video object-cover"
                loop
                muted
                playsInline
                onEnded={() => setIsPlaying(false)}
              />

              {/* Play/Pause overlay */}
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${
                  isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
                }`}
              >
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-primary-foreground" />
                  ) : (
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature bullets */}
        <ScrollReveal delay={400}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
            {[
              { title: t("demo.feature1_title"), desc: t("demo.feature1_desc") },
              { title: t("demo.feature2_title"), desc: t("demo.feature2_desc") },
              { title: t("demo.feature3_title"), desc: t("demo.feature3_desc") },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 text-center sm:text-left">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
