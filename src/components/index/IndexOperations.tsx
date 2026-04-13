import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Search, Warehouse, ArrowLeftRight, QrCode, ClipboardList } from "lucide-react";
import { MenuButton } from "@/components/dashboard/MenuButton";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface IndexOperationsProps {
  aguardandoRecebimento: number;
  triagemPendente: number;
}

export function IndexOperations({ aguardandoRecebimento, triagemPendente }: IndexOperationsProps) {
  const navigate = useNavigate();

  const items = [
    { icon: Package, label: "Recebimento", description: "Conferir materiais", badge: aguardandoRecebimento, path: "/recebimento" },
    { icon: Search, label: "Triagem", description: "Controle qualidade", badge: triagemPendente, path: "/triagem" },
    { icon: Warehouse, label: "Estoque", description: "Mapa visual", variant: "gradient" as const, path: "/estoque" },
    { icon: ArrowLeftRight, label: "Movimentação", description: "Transferências", path: "/movimentacao" },
    { icon: QrCode, label: "Scanner", description: "Ler QR Code", path: "/scanner" },
    { icon: ClipboardList, label: "Relatórios", description: "Exportar dados", path: "/relatorios" },
  ];

  return (
    <motion.section variants={itemVariants}>
      <h2 className="text-xs font-bold text-primary/60 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="w-4 h-px bg-primary/30" />
        Operações Rápidas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <motion.div key={item.label} variants={itemVariants} whileHover={{ y: -2 }}>
            <MenuButton icon={item.icon} label={item.label} description={item.description} badge={item.badge} variant={item.variant} onClick={() => navigate(item.path)} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
