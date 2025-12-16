import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  ArrowLeftRight, 
  Undo2, 
  Package, 
  Building2, 
  Calendar,
  FileText,
  Camera,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Eye,
  Filter,
  ChevronRight
} from "lucide-react";

// Types
type TipoRegistro = 'troca' | 'devolucao';
type StatusRegistro = 'pendente' | 'em_analise' | 'autorizado' | 'enviado' | 'concluido' | 'recusado';

interface RegistroTrocaDevolucao {
  id: string;
  tipo: TipoRegistro;
  status: StatusRegistro;
  produto: string;
  sku: string;
  quantidade: number;
  fornecedor: string;
  motivoDefeito: string;
  descricaoDefeito: string;
  fotos: string[];
  dataCriacao: Date;
  dataPrevisao: Date | null;
  nfDevolucao: string | null;
  nfOrigem: string;
  lote: string;
  observacoes: string;
  historicoStatus: { status: StatusRegistro; data: Date; usuario: string }[];
}

// Status configuration
const statusConfig: Record<StatusRegistro, { label: string; color: string; icon: React.ReactNode }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <Clock className="h-3 w-3" /> },
  em_analise: { label: 'Em Análise', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Eye className="h-3 w-3" /> },
  autorizado: { label: 'Autorizado', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  enviado: { label: 'Enviado', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: <Send className="h-3 w-3" /> },
  concluido: { label: 'Concluído', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  recusado: { label: 'Recusado', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <XCircle className="h-3 w-3" /> },
};

const statusWorkflow: StatusRegistro[] = ['pendente', 'em_analise', 'autorizado', 'enviado', 'concluido'];

const motivosDefeito = [
  'Defeito de fabricação',
  'Cor incorreta',
  'Dimensões fora do padrão',
  'Material danificado',
  'Impressão com falha',
  'Componente faltando',
  'Embalagem violada',
  'Produto incorreto',
  'Quantidade divergente',
  'Outro'
];

// Mock data
const mockRegistros: RegistroTrocaDevolucao[] = [
  {
    id: 'TD-001',
    tipo: 'troca',
    status: 'pendente',
    produto: 'Caneta Esferográfica Azul',
    sku: 'CAN-001',
    quantidade: 150,
    fornecedor: 'Fornecedor ABC',
    motivoDefeito: 'Defeito de fabricação',
    descricaoDefeito: 'Tinta vazando na ponta da caneta em 15% do lote',
    fotos: ['/placeholder.svg', '/placeholder.svg'],
    dataCriacao: new Date('2024-01-15'),
    dataPrevisao: new Date('2024-01-25'),
    nfDevolucao: null,
    nfOrigem: 'NF-2024-0125',
    lote: 'LT-2024-001',
    observacoes: 'Urgente - cliente VIP aguardando',
    historicoStatus: [
      { status: 'pendente', data: new Date('2024-01-15'), usuario: 'João Silva' }
    ]
  },
  {
    id: 'TD-002',
    tipo: 'devolucao',
    status: 'em_analise',
    produto: 'Camiseta Polo Branca M',
    sku: 'CAM-POL-001',
    quantidade: 80,
    fornecedor: 'Têxtil XYZ',
    motivoDefeito: 'Cor incorreta',
    descricaoDefeito: 'Tom de branco diferente do especificado na amostra',
    fotos: ['/placeholder.svg'],
    dataCriacao: new Date('2024-01-12'),
    dataPrevisao: new Date('2024-01-22'),
    nfDevolucao: null,
    nfOrigem: 'NF-2024-0118',
    lote: 'LT-2024-002',
    observacoes: '',
    historicoStatus: [
      { status: 'pendente', data: new Date('2024-01-12'), usuario: 'Maria Santos' },
      { status: 'em_analise', data: new Date('2024-01-14'), usuario: 'Carlos Lima' }
    ]
  },
  {
    id: 'TD-003',
    tipo: 'troca',
    status: 'autorizado',
    produto: 'Squeeze 500ml',
    sku: 'SQZ-500',
    quantidade: 200,
    fornecedor: 'Plásticos Beta',
    motivoDefeito: 'Impressão com falha',
    descricaoDefeito: 'Logo do cliente borrado em aproximadamente 40% das peças',
    fotos: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    dataCriacao: new Date('2024-01-10'),
    dataPrevisao: new Date('2024-01-20'),
    nfDevolucao: 'NF-DEV-2024-015',
    nfOrigem: 'NF-2024-0098',
    lote: 'LT-2024-003',
    observacoes: 'Fornecedor já confirmou envio de reposição',
    historicoStatus: [
      { status: 'pendente', data: new Date('2024-01-10'), usuario: 'João Silva' },
      { status: 'em_analise', data: new Date('2024-01-11'), usuario: 'Carlos Lima' },
      { status: 'autorizado', data: new Date('2024-01-13'), usuario: 'Ana Costa' }
    ]
  },
  {
    id: 'TD-004',
    tipo: 'devolucao',
    status: 'enviado',
    produto: 'Caderno Personalizado A5',
    sku: 'CAD-A5-001',
    quantidade: 500,
    fornecedor: 'Papelaria Premium',
    motivoDefeito: 'Material danificado',
    descricaoDefeito: 'Capas amassadas durante transporte',
    fotos: ['/placeholder.svg'],
    dataCriacao: new Date('2024-01-08'),
    dataPrevisao: new Date('2024-01-18'),
    nfDevolucao: 'NF-DEV-2024-012',
    nfOrigem: 'NF-2024-0087',
    lote: 'LT-2024-004',
    observacoes: 'Transportadora será responsabilizada',
    historicoStatus: [
      { status: 'pendente', data: new Date('2024-01-08'), usuario: 'Maria Santos' },
      { status: 'em_analise', data: new Date('2024-01-09'), usuario: 'Carlos Lima' },
      { status: 'autorizado', data: new Date('2024-01-10'), usuario: 'Ana Costa' },
      { status: 'enviado', data: new Date('2024-01-12'), usuario: 'João Silva' }
    ]
  },
  {
    id: 'TD-005',
    tipo: 'troca',
    status: 'concluido',
    produto: 'Chaveiro Metal',
    sku: 'CHV-MET-001',
    quantidade: 1000,
    fornecedor: 'Metalúrgica Delta',
    motivoDefeito: 'Componente faltando',
    descricaoDefeito: 'Argolas não foram incluídas na embalagem',
    fotos: ['/placeholder.svg'],
    dataCriacao: new Date('2024-01-05'),
    dataPrevisao: new Date('2024-01-15'),
    nfDevolucao: 'NF-DEV-2024-008',
    nfOrigem: 'NF-2024-0065',
    lote: 'LT-2024-005',
    observacoes: 'Troca concluída com sucesso',
    historicoStatus: [
      { status: 'pendente', data: new Date('2024-01-05'), usuario: 'João Silva' },
      { status: 'em_analise', data: new Date('2024-01-06'), usuario: 'Carlos Lima' },
      { status: 'autorizado', data: new Date('2024-01-07'), usuario: 'Ana Costa' },
      { status: 'enviado', data: new Date('2024-01-08'), usuario: 'Maria Santos' },
      { status: 'concluido', data: new Date('2024-01-12'), usuario: 'João Silva' }
    ]
  }
];

// Components
function StatusBadge({ status }: { status: StatusRegistro }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

function TipoBadge({ tipo }: { tipo: TipoRegistro }) {
  return (
    <Badge 
      variant="outline" 
      className={tipo === 'troca' 
        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
        : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      }
    >
      {tipo === 'troca' ? <ArrowLeftRight className="h-3 w-3 mr-1" /> : <Undo2 className="h-3 w-3 mr-1" />}
      {tipo === 'troca' ? 'Troca' : 'Devolução'}
    </Badge>
  );
}

function WorkflowProgress({ status }: { status: StatusRegistro }) {
  const currentIndex = statusWorkflow.indexOf(status);
  const isRecusado = status === 'recusado';
  
  return (
    <div className="flex items-center gap-1 w-full">
      {statusWorkflow.map((step, index) => {
        const isCompleted = !isRecusado && index <= currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <div key={step} className="flex items-center flex-1">
            <div 
              className={`h-2 flex-1 rounded-full transition-colors ${
                isCompleted ? 'bg-primary' : 'bg-muted'
              } ${isCurrent ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
            />
            {index < statusWorkflow.length - 1 && (
              <ChevronRight className={`h-3 w-3 mx-0.5 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RegistroCard({ registro, onView }: { registro: RegistroTrocaDevolucao; onView: () => void }) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={onView}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground font-mono">{registro.id}</span>
              <TipoBadge tipo={registro.tipo} />
              <StatusBadge status={registro.status} />
            </div>
            <h3 className="font-semibold truncate">{registro.produto}</h3>
            <p className="text-sm text-muted-foreground">SKU: {registro.sku}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{registro.quantidade}</p>
            <p className="text-xs text-muted-foreground">peças</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span className="truncate">{registro.fornecedor}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span className="truncate">{registro.nfOrigem}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="truncate">{registro.motivoDefeito}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{registro.dataCriacao.toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        
        <div className="mb-2">
          <WorkflowProgress status={registro.status} />
        </div>
        
        {registro.fotos.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Camera className="h-3 w-3" />
            {registro.fotos.length} foto(s)
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NovoRegistroDialog({ onSave }: { onSave: (registro: Partial<RegistroTrocaDevolucao>) => void }) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<TipoRegistro>('troca');
  const [produto, setProduto] = useState('');
  const [sku, setSku] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [motivoDefeito, setMotivoDefeito] = useState('');
  const [descricaoDefeito, setDescricaoDefeito] = useState('');
  const [nfOrigem, setNfOrigem] = useState('');
  const [lote, setLote] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  const handleSave = () => {
    onSave({
      tipo,
      produto,
      sku,
      quantidade: parseInt(quantidade),
      fornecedor,
      motivoDefeito,
      descricaoDefeito,
      nfOrigem,
      lote,
      observacoes,
      status: 'pendente',
      dataCriacao: new Date(),
      fotos: []
    });
    setOpen(false);
    // Reset form
    setTipo('troca');
    setProduto('');
    setSku('');
    setQuantidade('');
    setFornecedor('');
    setMotivoDefeito('');
    setDescricaoDefeito('');
    setNfOrigem('');
    setLote('');
    setObservacoes('');
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Registro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Troca/Devolução</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoRegistro)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="troca">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Troca
                  </div>
                </SelectItem>
                <SelectItem value="devolucao">
                  <div className="flex items-center gap-2">
                    <Undo2 className="h-4 w-4" />
                    Devolução
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Input 
                placeholder="Nome do produto" 
                value={produto} 
                onChange={(e) => setProduto(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input 
                placeholder="SKU-001" 
                value={sku} 
                onChange={(e) => setSku(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input 
                type="number" 
                placeholder="0" 
                value={quantidade} 
                onChange={(e) => setQuantidade(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Input 
                placeholder="Nome do fornecedor" 
                value={fornecedor} 
                onChange={(e) => setFornecedor(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>NF Origem</Label>
              <Input 
                placeholder="NF-2024-0001" 
                value={nfOrigem} 
                onChange={(e) => setNfOrigem(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Lote</Label>
              <Input 
                placeholder="LT-2024-001" 
                value={lote} 
                onChange={(e) => setLote(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Motivo do Defeito</Label>
            <Select value={motivoDefeito} onValueChange={setMotivoDefeito}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {motivosDefeito.map((motivo) => (
                  <SelectItem key={motivo} value={motivo}>{motivo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Descrição do Defeito</Label>
            <Textarea 
              placeholder="Descreva o defeito em detalhes..." 
              value={descricaoDefeito} 
              onChange={(e) => setDescricaoDefeito(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Fotos do Defeito</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Clique para adicionar fotos</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea 
              placeholder="Observações adicionais..." 
              value={observacoes} 
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!produto || !quantidade || !fornecedor || !motivoDefeito}>
            Registrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetalheRegistroDialog({ registro, open, onClose, onStatusChange }: { 
  registro: RegistroTrocaDevolucao | null; 
  open: boolean; 
  onClose: () => void;
  onStatusChange: (id: string, newStatus: StatusRegistro) => void;
}) {
  const [nfDevolucao, setNfDevolucao] = useState('');
  
  if (!registro) return null;
  
  const currentIndex = statusWorkflow.indexOf(registro.status);
  const nextStatus = currentIndex < statusWorkflow.length - 1 ? statusWorkflow[currentIndex + 1] : null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-muted-foreground">{registro.id}</span>
            <TipoBadge tipo={registro.tipo} />
            <StatusBadge status={registro.status} />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">{registro.produto}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">SKU</p>
                <p className="font-medium">{registro.sku}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Quantidade</p>
                <p className="font-medium text-primary">{registro.quantidade} peças</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lote</p>
                <p className="font-medium">{registro.lote}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fornecedor</p>
                <p className="font-medium">{registro.fornecedor}</p>
              </div>
            </div>
          </div>
          
          {/* Workflow Progress */}
          <div>
            <h4 className="font-medium mb-3">Progresso do Workflow</h4>
            <div className="flex items-center gap-2">
              {statusWorkflow.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const config = statusConfig[step];
                
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex flex-col items-center flex-1 ${isCurrent ? 'scale-110' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                        isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {config.icon}
                      </div>
                      <span className={`text-xs text-center ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {config.label}
                      </span>
                    </div>
                    {index < statusWorkflow.length - 1 && (
                      <div className={`h-0.5 w-full ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Defect Info */}
          <div>
            <h4 className="font-medium mb-2">Informações do Defeito</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{registro.motivoDefeito}</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{registro.descricaoDefeito}</p>
            </div>
          </div>
          
          {/* Photos */}
          {registro.fotos.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Fotos do Defeito</h4>
              <div className="grid grid-cols-3 gap-2">
                {registro.fotos.map((foto, idx) => (
                  <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Documents */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">NF Origem</p>
              <p className="font-medium flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {registro.nfOrigem}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">NF Devolução</p>
              {registro.nfDevolucao ? (
                <p className="font-medium flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {registro.nfDevolucao}
                </p>
              ) : registro.status === 'autorizado' ? (
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="NF-DEV-..." 
                    value={nfDevolucao}
                    onChange={(e) => setNfDevolucao(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Aguardando autorização</p>
              )}
            </div>
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Data de Criação</p>
              <p className="font-medium">{registro.dataCriacao.toLocaleDateString('pt-BR')}</p>
            </div>
            {registro.dataPrevisao && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Previsão de Conclusão</p>
                <p className="font-medium">{registro.dataPrevisao.toLocaleDateString('pt-BR')}</p>
              </div>
            )}
          </div>
          
          {/* Status History */}
          <div>
            <h4 className="font-medium mb-2">Histórico de Status</h4>
            <div className="space-y-2">
              {registro.historicoStatus.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <StatusBadge status={item.status} />
                  <span className="text-muted-foreground">
                    {item.data.toLocaleDateString('pt-BR')} - {item.usuario}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Observations */}
          {registro.observacoes && (
            <div>
              <h4 className="font-medium mb-2">Observações</h4>
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                {registro.observacoes}
              </p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          {registro.status !== 'concluido' && registro.status !== 'recusado' && nextStatus && (
            <div className="flex gap-2">
              <Button 
                onClick={() => onStatusChange(registro.id, nextStatus)}
                disabled={registro.status === 'autorizado' && !registro.nfDevolucao && !nfDevolucao}
              >
                Avançar para {statusConfig[nextStatus].label}
              </Button>
              {!['concluido', 'recusado'].includes(registro.status) && (
                <Button 
                  variant="destructive" 
                  onClick={() => onStatusChange(registro.id, 'recusado')}
                >
                  Recusar
                </Button>
              )}
            </div>
          )}
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Page
export default function TrocasDevolucoes() {
  const [registros, setRegistros] = useState(mockRegistros);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoRegistro | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<StatusRegistro | 'todos'>('todos');
  const [registroSelecionado, setRegistroSelecionado] = useState<RegistroTrocaDevolucao | null>(null);
  const [activeTab, setActiveTab] = useState('pendentes');
  
  // Filter registros
  const filteredRegistros = useMemo(() => {
    return registros.filter(r => {
      const matchesSearch = 
        r.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTipo = filtroTipo === 'todos' || r.tipo === filtroTipo;
      const matchesStatus = filtroStatus === 'todos' || r.status === filtroStatus;
      
      // Tab filtering
      let matchesTab = true;
      if (activeTab === 'pendentes') {
        matchesTab = ['pendente', 'em_analise'].includes(r.status);
      } else if (activeTab === 'em_andamento') {
        matchesTab = ['autorizado', 'enviado'].includes(r.status);
      } else if (activeTab === 'concluidos') {
        matchesTab = ['concluido', 'recusado'].includes(r.status);
      }
      
      return matchesSearch && matchesTipo && matchesStatus && matchesTab;
    });
  }, [registros, searchTerm, filtroTipo, filtroStatus, activeTab]);
  
  // Summary counts
  const counts = useMemo(() => ({
    pendentes: registros.filter(r => ['pendente', 'em_analise'].includes(r.status)).length,
    em_andamento: registros.filter(r => ['autorizado', 'enviado'].includes(r.status)).length,
    concluidos: registros.filter(r => ['concluido', 'recusado'].includes(r.status)).length,
    trocas: registros.filter(r => r.tipo === 'troca').length,
    devolucoes: registros.filter(r => r.tipo === 'devolucao').length,
  }), [registros]);
  
  const handleNovoRegistro = (registro: Partial<RegistroTrocaDevolucao>) => {
    const novoId = `TD-${String(registros.length + 1).padStart(3, '0')}`;
    const novoRegistro: RegistroTrocaDevolucao = {
      ...registro as RegistroTrocaDevolucao,
      id: novoId,
      historicoStatus: [{ status: 'pendente', data: new Date(), usuario: 'Usuário Atual' }]
    };
    setRegistros([novoRegistro, ...registros]);
  };
  
  const handleStatusChange = (id: string, newStatus: StatusRegistro) => {
    setRegistros(registros.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: newStatus,
          historicoStatus: [
            ...r.historicoStatus,
            { status: newStatus, data: new Date(), usuario: 'Usuário Atual' }
          ]
        };
      }
      return r;
    }));
    setRegistroSelecionado(null);
  };
  
  return (
    <AppLayout 
      title="Trocas e Devoluções" 
      rightAction={<NovoRegistroDialog onSave={handleNovoRegistro} />}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{counts.pendentes}</div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{counts.em_andamento}</div>
              <p className="text-xs text-muted-foreground">Em Andamento</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{counts.concluidos}</div>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{counts.trocas}</div>
              <p className="text-xs text-muted-foreground">Trocas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-500">{counts.devolucoes}</div>
              <p className="text-xs text-muted-foreground">Devoluções</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="pendentes">
                Pendentes ({counts.pendentes})
              </TabsTrigger>
              <TabsTrigger value="em_andamento">
                Em Andamento ({counts.em_andamento})
              </TabsTrigger>
              <TabsTrigger value="concluidos">
                Concluídos ({counts.concluidos})
              </TabsTrigger>
              <TabsTrigger value="todos">
                Todos
              </TabsTrigger>
            </TabsList>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as TipoRegistro | 'todos')}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="troca">Trocas</SelectItem>
                  <SelectItem value="devolucao">Devoluções</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value={activeTab} className="mt-4">
            {filteredRegistros.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum registro encontrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRegistros.map((registro) => (
                  <RegistroCard 
                    key={registro.id} 
                    registro={registro} 
                    onView={() => setRegistroSelecionado(registro)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Detail Dialog */}
      <DetalheRegistroDialog 
        registro={registroSelecionado}
        open={!!registroSelecionado}
        onClose={() => setRegistroSelecionado(null)}
        onStatusChange={handleStatusChange}
      />
    </AppLayout>
  );
}
