import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

// Templates de desafios por tipo
const DESAFIOS_TEMPLATES = [
  // Triagens
  { tipo: 'triagem', titulo: 'Triador Iniciante', descricao: 'Complete {meta} triagens hoje', meta: 5, xp: 50, dificuldade: 'facil' },
  { tipo: 'triagem', titulo: 'Triador Dedicado', descricao: 'Complete {meta} triagens hoje', meta: 10, xp: 100, dificuldade: 'normal' },
  { tipo: 'triagem', titulo: 'Mestre da Triagem', descricao: 'Complete {meta} triagens hoje', meta: 20, xp: 200, dificuldade: 'dificil' },
  
  // Velocidade
  { tipo: 'velocidade', titulo: 'Velocista', descricao: 'Complete {meta} triagens ultra-rápidas (menos de 2 min)', meta: 3, xp: 75, dificuldade: 'normal' },
  { tipo: 'velocidade', titulo: 'Flash da Triagem', descricao: 'Complete {meta} triagens ultra-rápidas', meta: 5, xp: 150, dificuldade: 'dificil' },
  
  // Qualidade
  { tipo: 'qualidade', titulo: 'Aprovador', descricao: 'Aprove {meta} itens na triagem', meta: 5, xp: 60, dificuldade: 'facil' },
  { tipo: 'qualidade', titulo: 'Olho de Águia', descricao: 'Aprove {meta} itens na triagem', meta: 15, xp: 120, dificuldade: 'normal' },
  
  // Tarefas
  { tipo: 'tarefa', titulo: 'Trabalhador', descricao: 'Complete {meta} tarefas hoje', meta: 3, xp: 50, dificuldade: 'facil' },
  { tipo: 'tarefa', titulo: 'Produtivo', descricao: 'Complete {meta} tarefas hoje', meta: 8, xp: 100, dificuldade: 'normal' },
  { tipo: 'tarefa', titulo: 'Incansável', descricao: 'Complete {meta} tarefas hoje', meta: 15, xp: 200, dificuldade: 'dificil' },
  
  // XP
  { tipo: 'xp', titulo: 'Caçador de XP', descricao: 'Ganhe {meta} XP hoje', meta: 100, xp: 50, dificuldade: 'facil' },
  { tipo: 'xp', titulo: 'Acumulador', descricao: 'Ganhe {meta} XP hoje', meta: 300, xp: 100, dificuldade: 'normal' },
  { tipo: 'xp', titulo: 'XP Master', descricao: 'Ganhe {meta} XP hoje', meta: 500, xp: 175, dificuldade: 'dificil' },
  
  // Streak
  { tipo: 'streak', titulo: 'Consistente', descricao: 'Mantenha seu streak de {meta} dias', meta: 3, xp: 75, dificuldade: 'facil' },
  { tipo: 'streak', titulo: 'Dedicação', descricao: 'Mantenha seu streak de {meta} dias', meta: 7, xp: 150, dificuldade: 'normal' },
]

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function selectDailyDesafios(count: number = 5) {
  const shuffled = shuffleArray(DESAFIOS_TEMPLATES)
  
  // Garantir variedade de dificuldades
  const faceis = shuffled.filter(d => d.dificuldade === 'facil')
  const normais = shuffled.filter(d => d.dificuldade === 'normal')
  const dificeis = shuffled.filter(d => d.dificuldade === 'dificil')
  
  const selected: typeof DESAFIOS_TEMPLATES = []
  
  // 2 fáceis, 2 normais, 1 difícil
  if (faceis.length >= 2) selected.push(faceis[0], faceis[1])
  if (normais.length >= 2) selected.push(normais[0], normais[1])
  if (dificeis.length >= 1) selected.push(dificeis[0])
  
  // Preencher o restante se necessário
  while (selected.length < count && shuffled.length > selected.length) {
    const next = shuffled.find(d => !selected.includes(d))
    if (next) selected.push(next)
  }
  
  return selected.slice(0, count)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Data de hoje (formato YYYY-MM-DD)
    const hoje = new Date().toISOString().split('T')[0]
    
    console.log(`Gerando desafios para: ${hoje}`)
    
    // Verificar se já existem desafios para hoje
    const { data: existentes, error: checkError } = await supabase
      .from('desafios_diarios')
      .select('id')
      .eq('data_ativo', hoje)
      .eq('ativo', true)
    
    if (checkError) {
      console.error('Erro ao verificar desafios existentes:', checkError)
      throw checkError
    }
    
    if (existentes && existentes.length > 0) {
      console.log(`Já existem ${existentes.length} desafios para hoje`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Já existem ${existentes.length} desafios para hoje`,
          desafios: existentes.length 
        }),
        { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }
    
    // Desativar desafios antigos
    const { error: deactivateError } = await supabase
      .from('desafios_diarios')
      .update({ ativo: false })
      .neq('data_ativo', hoje)
      .eq('ativo', true)
    
    if (deactivateError) {
      console.error('Erro ao desativar desafios antigos:', deactivateError)
    }
    
    // Selecionar desafios para hoje
    const desafiosSelecionados = selectDailyDesafios(5)
    
    // Inserir novos desafios
    const desafiosParaInserir = desafiosSelecionados.map(d => ({
      titulo: d.titulo,
      descricao: d.descricao.replace('{meta}', d.meta.toString()),
      tipo: d.tipo,
      meta: d.meta,
      xp_recompensa: d.xp,
      dificuldade: d.dificuldade,
      data_ativo: hoje,
      ativo: true,
    }))
    
    const { data: inserted, error: insertError } = await supabase
      .from('desafios_diarios')
      .insert(desafiosParaInserir)
      .select()
    
    if (insertError) {
      console.error('Erro ao inserir desafios:', insertError)
      throw insertError
    }
    
    console.log(`${inserted?.length || 0} desafios criados com sucesso`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${inserted?.length || 0} desafios criados para ${hoje}`,
        desafios: inserted 
      }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    )
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Erro ao gerar desafios:', errorMessage)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    )
  }
})
