-- Create nfe_documents table
CREATE TABLE IF NOT EXISTS public.nfe_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave_acesso VARCHAR(44) UNIQUE,
    numero VARCHAR(20),
    serie VARCHAR(10),
    data_emissao TIMESTAMP WITH TIME ZONE,
    emitente_cnpj VARCHAR(14),
    emitente_nome TEXT,
    valor_total DECIMAL(12, 2),
    xml_content TEXT,
    status VARCHAR(20) DEFAULT 'pendente',
    operador_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create nfe_items table
CREATE TABLE IF NOT EXISTS public.nfe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nfe_id UUID REFERENCES public.nfe_documents(id) ON DELETE CASCADE,
    codigo_produto TEXT,
    descricao TEXT,
    ncm VARCHAR(8),
    cfop VARCHAR(4),
    unidade VARCHAR(10),
    quantidade DECIMAL(12, 4),
    valor_unitario DECIMAL(12, 4),
    valor_total DECIMAL(12, 2),
    produto_id UUID REFERENCES public.produtos(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nfe_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfe_items ENABLE ROW LEVEL SECURITY;

-- Policies for nfe_documents
CREATE POLICY "Users can view nfe_documents" ON public.nfe_documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins/Supervisors can insert nfe_documents" ON public.nfe_documents FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor'))
);
CREATE POLICY "Admins/Supervisors can update nfe_documents" ON public.nfe_documents FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor'))
);

-- Policies for nfe_items
CREATE POLICY "Users can view nfe_items" ON public.nfe_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins/Supervisors can insert nfe_items" ON public.nfe_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor'))
);

-- Trigger for updated_at on nfe_documents
CREATE TRIGGER update_nfe_documents_updated_at
    BEFORE UPDATE ON public.nfe_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
