// i18n configuration placeholder
// To enable full i18n, install: npm install i18next react-i18next

export const defaultLocale = 'pt-BR';

export const translations = {
  'pt-BR': {
    common: {
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
    },
    estoque: {
      title: 'Gestão de Estoque',
      posicao: 'Posição',
      quantidade: 'Quantidade',
      disponivel: 'Disponível',
    },
    triagem: {
      title: 'Triagem',
      lote: 'Lote',
      iniciar: 'Iniciar Triagem',
      finalizar: 'Finalizar',
    },
  },
};

export function t(key: string, locale = defaultLocale): string {
  const keys = key.split('.');
  let value: any = translations[locale as keyof typeof translations];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

export default { t, defaultLocale, translations };
