import { motion } from "framer-motion";
import { Search, CalendarDays, MessageSquare, CheckCircle } from "lucide-react";
import { t } from "@/lib/translations";

const steps = [
  { key: "step1", icon: Search, color: "bg-blue-500/10 text-blue-500", iconColor: "text-blue-500" },
  { key: "step2", icon: CalendarDays, color: "bg-accent/10 text-accent", iconColor: "text-accent" },
  { key: "step3", icon: MessageSquare, color: "bg-purple-500/10 text-purple-500", iconColor: "text-purple-500" },
  { key: "step4", icon: CheckCircle, color: "bg-green-500/10 text-green-500", iconColor: "text-green-500" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32 bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent mb-4 block">
            {t("how.label")}
          </span>
          <h2 className="text-4xl sm:text-5xl font-heading text-foreground mb-6 font-bold">
            {t("how.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("how.subtitle")}
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative"
        >
          {/* Animated connecting line */}
          <div className="absolute top-12 left-[12%] right-[12%] hidden md:block">
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
              className="h-1 bg-gradient-to-r from-blue-500 via-accent to-green-500 origin-left opacity-20 rounded-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div 
                key={step.key} 
                variants={itemVariants}
                className="relative text-center group"
              >
                <div className="relative mb-8">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-24 h-24 ${step.color} rounded-[2rem] flex items-center justify-center mx-auto relative z-10 shadow-sm border border-white/5 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-accent/10`}
                  >
                    <step.icon className={`w-10 h-10 ${step.iconColor}`} />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.8 + (i * 0.2), type: "spring", stiffness: 200 }}
                    className="absolute -top-2 -right-2 w-10 h-10 bg-background border-2 border-accent text-accent rounded-full flex items-center justify-center text-sm font-black z-20 shadow-lg hidden md:flex"
                  >
                    {i + 1}
                  </motion.div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                  {t(`how.${step.key}`)}
                </h3>
                <p className="text-muted-foreground leading-loose text-sm px-4">
                  {t(`how.${step.key}_desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
