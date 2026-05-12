import { useState, useMemo } from "react";
import { useTarefas } from "@/hooks/useTarefas";
import { toast } from "sonner";
import { TipoTarefa, StatusTarefa, PrioridadeTarefa, statusLabels, tipoLabels } from "@/types/tarefas";

export function useGestaoTarefasPage() {
  const { tarefas, isLoading, error, createTarefa, completarTarefa } = useTarefas();
  const safeTarefas = tarefas ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [showNovaTarefa, setShowNovaTarefa] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [novaTarefa, setNovaTarefa] = useState({
    tipo: "separacao" as TipoTarefa,
    descricao: "",
    prioridade: "media" as PrioridadeTarefa,
    quantidade: 0,
  });

  const stats = useMemo(() => ({
    total: safeTarefas.length,
    pendentes: safeTarefas.filter((t: any) => t.status === "pendente").length,
    emAndamento: safeTarefas.filter((t: any) => t.status === "em_andamento").length,
    concluidas: safeTarefas.filter((t: any) => t.status === "concluida").length,
  }), [safeTarefas]);

  const tarefasFiltradas = useMemo(() => {
    return safeTarefas.filter((t: any) => {
      const matchSearch = searchTerm === "" || t.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filtroStatus === "todos" || t.status === filtroStatus;
      const matchTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
      return matchSearch && matchStatus && matchTipo;
    });
  }, [safeTarefas, searchTerm, filtroStatus, filtroTipo]);

  const COLORS = ['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(221, 83%, 53%)'];

  const dadosStatus = useMemo(() => {
    return Object.entries(statusLabels).map(([status, label], i) => ({
      name: label,
      value: safeTarefas.filter((t: any) => t.status === status).length,
      color: COLORS[i % COLORS.length],
    })).filter(d => d.value > 0);
  }, [safeTarefas]);

  const dadosTipo = useMemo(() => {
    return Object.entries(tipoLabels).map(([tipo, label]) => ({
      tipo: label,
      quantidade: safeTarefas.filter((t: any) => t.tipo === tipo).length,
    })).filter(d => d.quantidade > 0);
  }, [safeTarefas]);

  const handleCriarTarefa = async () => {
    if (!novaTarefa.descricao) {
      toast.error("Descrição é obrigatória");
      return;
    }
    setSubmitting(true);
    try {
      await createTarefa.mutateAsync({
        tipo: novaTarefa.tipo,
        descricao: novaTarefa.descricao,
        prioridade: novaTarefa.prioridade,
        quantidade: novaTarefa.quantidade || 1,
      });
      setShowNovaTarefa(false);
      setNovaTarefa({ tipo: "separacao", descricao: "", prioridade: "media", quantidade: 0 });
      toast.success("Tarefa criada com sucesso");
    } catch {
      toast.error("Erro ao criar tarefa");
    } finally {
      setSubmitting(false);
    }
  };

  const handleIniciar = async (id: string) => {
    toast.info("Tarefa iniciada");
  };

  const handleConcluir = async (id: string) => {
    try {
      await completarTarefa.mutateAsync(id);
      toast.success("Tarefa concluída");
    } catch {
      toast.error("Erro ao concluir tarefa");
    }
  };

  return {
    isLoading,
    searchTerm,
    setSearchTerm,
    filtroStatus,
    setFiltroStatus,
    filtroTipo,
    setFiltroTipo,
    showNovaTarefa,
    setShowNovaTarefa,
    submitting,
    novaTarefa,
    setNovaTarefa,
    stats,
    tarefasFiltradas,
    dadosStatus,
    dadosTipo,
    handleCriarTarefa,
    handleIniciar,
    handleConcluir
  };
}