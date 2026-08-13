-- Adicionar pontos ao perfil de gamificação
ALTER TABLE public.gamificacao_usuarios ADD COLUMN IF NOT EXISTS pontos INTEGER DEFAULT 0;

-- Tabela da Loja
CREATE TABLE IF NOT EXISTS public.gamificacao_loja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    preco INTEGER NOT NULL,
    imagem_url TEXT,
    categoria TEXT DEFAULT 'cosmetico', -- cosmetico, powerup, real
    estoque INTEGER DEFAULT -1, -- -1 para infinito
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Transações/Compras
CREATE TABLE IF NOT EXISTS public.gamificacao_transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    item_id UUID REFERENCES public.gamificacao_loja(id),
    valor INTEGER NOT NULL,
    data_compra TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS
ALTER TABLE public.gamificacao_loja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamificacao_transacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ver a loja" ON public.gamificacao_loja FOR SELECT USING (true);
CREATE POLICY "Usuários veem suas próprias transações" ON public.gamificacao_transacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem comprar itens" ON public.gamificacao_transacoes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Inserir itens iniciais na loja
INSERT INTO public.gamificacao_loja (nome, descricao, preco, categoria, imagem_url) VALUES
('Multiplicador 2x XP', 'Dobra seu XP por 1 hora', 500, 'powerup', 'https://api.dicebear.com/7.x/icons/svg?seed=Zap'),
('Avatar Premium: Ninja do WMS', 'Desbloqueia um avatar exclusivo', 1200, 'cosmetico', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ninja'),
('Voucher Café', 'Ganhe um café grátis na copa', 800, 'real', 'https://api.dicebear.com/7.x/icons/svg?seed=Coffee'),
('Badge: Mestre da Triagem', 'Exibe um ícone especial no seu perfil', 1500, 'cosmetico', 'https://api.dicebear.com/7.x/icons/svg?seed=Star');
