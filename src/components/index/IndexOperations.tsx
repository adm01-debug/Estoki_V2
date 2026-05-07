import { motion } from "framer-motion";
import { Package, Search, Warehouse, ArrowLeftRight, QrCode, ClipboardList } from "lucide-react";
import { MenuButton } from "@/components/dashboard/MenuButton";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface Props {
  aguardandoRecebimento: number;
  triagemPendente: number;
  onNavigate: (path: string) => void;
}

export function IndexOperations({ aguardandoRecebimento, triagemPendente, onNavigate }: Props) {
  const items = [
    { icon: Package, label: "Recebimento", description: "Conferir materiais", badge: aguardandoRecebimento, path: "/recebimento" },
    { icon: Search, label: "Triagem", description: "Controle de qualidade", badge: triagemPendente, path: "/triagem" },
    { icon: Warehouse, label: "Estoque", description: "Gestão e mapa visual", variant: "gradient" as const, path: "/estoque" },
    { icon: ArrowLeftRight, label: "Movimentação", description: "Fluxo de mercadorias", path: "/movimentacao" },
    { icon: QrCode, label: "Scanner Pro", description: "Leitura inteligente", path: "/scanner" },
    { icon: ClipboardList, label: "Análise", description: "Relatórios estratégicos", path: "/relatorios" },
  ];

  return (
    <motion.section variants={itemVariants} className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-overline whitespace-nowrap">Operações Rápidas</h2>
        <div className="h-px w-full bg-gradient-to-r from-border/50 to-transparent" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <motion.div 
            key={item.label} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <MenuButton 
              icon={item.icon} 
              label={item.label} 
              description={item.description} 
              badge={item.badge} 
              variant={item.variant} 
              onClick={() => onNavigate(item.path)} 
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
}
