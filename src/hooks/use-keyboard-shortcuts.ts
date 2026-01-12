/**
 * Hook de Atalhos de Teclado
 * Sistema unificado de keyboard shortcuts
 */

import { useEffect, useCallback, useRef } from 'react';

type ModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta';
type KeyHandler = (event: KeyboardEvent) => void;

interface ShortcutConfig {
  key: string;
  modifiers?: ModifierKey[];
  handler: KeyHandler;
  description?: string;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  target?: 'window' | 'document' | React.RefObject<HTMLElement>;
}

// Shortcuts globais padrão do ESTOKI
export const GLOBAL_SHORTCUTS: Record<string, Omit<ShortcutConfig, 'handler'>> = {
  SEARCH: { key: 'k', modifiers: ['ctrl'], description: 'Abrir busca' },
  NEW_ITEM: { key: 'n', modifiers: ['ctrl'], description: 'Novo item' },
  SAVE: { key: 's', modifiers: ['ctrl'], description: 'Salvar' },
  CANCEL: { key: 'Escape', description: 'Cancelar/Fechar' },
  HELP: { key: '?', modifiers: ['shift'], description: 'Ajuda' },
  REFRESH: { key: 'r', modifiers: ['ctrl'], description: 'Atualizar' },
  HOME: { key: 'h', modifiers: ['ctrl', 'shift'], description: 'Ir para Home' },
  INVENTORY: { key: 'i', modifiers: ['ctrl', 'shift'], description: 'Ir para Inventário' },
  RECEIVING: { key: 'e', modifiers: ['ctrl', 'shift'], description: 'Ir para Recebimento' },
  SHIPPING: { key: 'x', modifiers: ['ctrl', 'shift'], description: 'Ir para Expedição' },
};

// Verificar se modifiers batem
function checkModifiers(event: KeyboardEvent, modifiers: ModifierKey[] = []): boolean {
  const requiredCtrl = modifiers.includes('ctrl');
  const requiredAlt = modifiers.includes('alt');
  const requiredShift = modifiers.includes('shift');
  const requiredMeta = modifiers.includes('meta');

  return (
    event.ctrlKey === requiredCtrl &&
    event.altKey === requiredAlt &&
    event.shiftKey === requiredShift &&
    event.metaKey === requiredMeta
  );
}

// Normalizar tecla
function normalizeKey(key: string): string {
  const keyMap: Record<string, string> = {
    'esc': 'Escape',
    'escape': 'Escape',
    'enter': 'Enter',
    'return': 'Enter',
    'space': ' ',
    'up': 'ArrowUp',
    'down': 'ArrowDown',
    'left': 'ArrowLeft',
    'right': 'ArrowRight',
    'backspace': 'Backspace',
    'delete': 'Delete',
    'tab': 'Tab',
  };
  return keyMap[key.toLowerCase()] || key;
}

// Hook principal
export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true, target = 'window' } = options;
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorar se estiver digitando em input/textarea
    const targetElement = event.target as HTMLElement;
    const isEditable = 
      targetElement.tagName === 'INPUT' ||
      targetElement.tagName === 'TEXTAREA' ||
      targetElement.isContentEditable;

    for (const shortcut of shortcutsRef.current) {
      if (shortcut.enabled === false) continue;

      const normalizedKey = normalizeKey(shortcut.key);
      const eventKey = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const shortcutKey = normalizedKey.length === 1 ? normalizedKey.toLowerCase() : normalizedKey;

      if (eventKey === shortcutKey && checkModifiers(event, shortcut.modifiers)) {
        // Permitir Escape mesmo em inputs
        if (isEditable && shortcut.key !== 'Escape') {
          continue;
        }

        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        if (shortcut.stopPropagation) {
          event.stopPropagation();
        }
        shortcut.handler(event);
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let targetElement: EventTarget;
    
    if (target === 'window') {
      targetElement = window;
    } else if (target === 'document') {
      targetElement = document;
    } else if (target.current) {
      targetElement = target.current;
    } else {
      return;
    }

    targetElement.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [enabled, target, handleKeyDown]);
}

// Hook simplificado para um único shortcut
export function useKeyboardShortcut(
  key: string,
  handler: KeyHandler,
  modifiers: ModifierKey[] = [],
  options: Omit<UseKeyboardShortcutsOptions, 'shortcuts'> = {}
): void {
  useKeyboardShortcuts(
    [{ key, modifiers, handler }],
    options
  );
}

// Hook para navegação com setas
export function useArrowNavigation(options: {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onEnter?: () => void;
  enabled?: boolean;
}): void {
  const shortcuts: ShortcutConfig[] = [];

  if (options.onUp) shortcuts.push({ key: 'ArrowUp', handler: options.onUp });
  if (options.onDown) shortcuts.push({ key: 'ArrowDown', handler: options.onDown });
  if (options.onLeft) shortcuts.push({ key: 'ArrowLeft', handler: options.onLeft });
  if (options.onRight) shortcuts.push({ key: 'ArrowRight', handler: options.onRight });
  if (options.onEnter) shortcuts.push({ key: 'Enter', handler: options.onEnter });

  useKeyboardShortcuts(shortcuts, { enabled: options.enabled });
}

// Componente para mostrar ajuda de shortcuts
export function getShortcutDisplay(shortcut: ShortcutConfig): string {
  const modifierSymbols: Record<ModifierKey, string> = {
    ctrl: '⌘',
    alt: '⌥',
    shift: '⇧',
    meta: '⌘',
  };

  const parts: string[] = [];
  
  if (shortcut.modifiers) {
    for (const mod of shortcut.modifiers) {
      parts.push(modifierSymbols[mod]);
    }
  }
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
}

export default useKeyboardShortcuts;
