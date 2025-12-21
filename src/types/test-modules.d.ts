// Type declarations for test modules - these allow TypeScript to compile without errors
// The actual implementations come from dev dependencies during test runs

declare module 'vitest' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function expect<T>(value: T): {
    toBe(expected: T): void;
    toEqual(expected: unknown): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThan(expected: number): void;
    toBeLessThanOrEqual(expected: number): void;
    toContain(expected: unknown): void;
    toHaveLength(expected: number): void;
    toHaveProperty(key: string, value?: unknown): void;
    toThrow(expected?: string | RegExp | Error): void;
    toMatch(expected: string | RegExp): void;
    toMatchObject(expected: object): void;
    toBeInstanceOf(expected: unknown): void;
    not: {
      toBe(expected: T): void;
      toEqual(expected: unknown): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toBeNull(): void;
      toBeUndefined(): void;
      toBeDefined(): void;
      toContain(expected: unknown): void;
      toHaveLength(expected: number): void;
      toThrow(expected?: string | RegExp | Error): void;
    };
  };
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
  export const vi: {
    fn<T extends (...args: unknown[]) => unknown>(implementation?: T): T & {
      mock: { calls: unknown[][] };
      mockReturnValue(value: unknown): unknown;
      mockResolvedValue(value: unknown): unknown;
      mockRejectedValue(value: unknown): unknown;
      mockImplementation(fn: T): unknown;
      mockReturnThis(): unknown;
      mockClear(): void;
      mockReset(): void;
    };
    spyOn<T extends object, K extends keyof T>(obj: T, method: K): {
      mockReturnValue(value: unknown): unknown;
      mockResolvedValue(value: unknown): unknown;
      mockRejectedValue(value: unknown): unknown;
      mockImplementation(fn: unknown): unknown;
      mockReturnThis(): unknown;
    };
    mock(path: string, factory?: () => unknown): void;
    unmock(path: string): void;
    clearAllMocks(): void;
    resetAllMocks(): void;
    useFakeTimers(): void;
    useRealTimers(): void;
    advanceTimersByTime(ms: number): void;
    runAllTimers(): void;
  };
}

declare module '@testing-library/react' {
  import { ReactElement } from 'react';
  
  export interface RenderResult {
    container: HTMLElement;
    baseElement: HTMLElement;
    debug: (element?: HTMLElement) => void;
    rerender: (ui: ReactElement) => void;
    unmount: () => void;
    asFragment: () => DocumentFragment;
    getByText: (text: string | RegExp) => HTMLElement;
    queryByText: (text: string | RegExp) => HTMLElement | null;
    findByText: (text: string | RegExp) => Promise<HTMLElement>;
    getByRole: (role: string, options?: object) => HTMLElement;
    queryByRole: (role: string, options?: object) => HTMLElement | null;
    findByRole: (role: string, options?: object) => Promise<HTMLElement>;
    getByTestId: (testId: string) => HTMLElement;
    queryByTestId: (testId: string) => HTMLElement | null;
    findByTestId: (testId: string) => Promise<HTMLElement>;
    getByLabelText: (text: string | RegExp) => HTMLElement;
    queryByLabelText: (text: string | RegExp) => HTMLElement | null;
    findByLabelText: (text: string | RegExp) => Promise<HTMLElement>;
    getByPlaceholderText: (text: string | RegExp) => HTMLElement;
    queryByPlaceholderText: (text: string | RegExp) => HTMLElement | null;
    findByPlaceholderText: (text: string | RegExp) => Promise<HTMLElement>;
    getAllByText: (text: string | RegExp) => HTMLElement[];
    queryAllByText: (text: string | RegExp) => HTMLElement[];
    findAllByText: (text: string | RegExp) => Promise<HTMLElement[]>;
    getAllByRole: (role: string, options?: object) => HTMLElement[];
    queryAllByRole: (role: string, options?: object) => HTMLElement[];
    findAllByRole: (role: string, options?: object) => Promise<HTMLElement[]>;
  }
  
  export interface RenderOptions {
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
    container?: HTMLElement;
    baseElement?: HTMLElement;
  }
  
  export function render(ui: ReactElement, options?: RenderOptions): RenderResult;
  export function renderHook<Result, Props>(
    render: (props: Props) => Result,
    options?: { wrapper?: React.ComponentType<{ children: React.ReactNode }> }
  ): {
    result: { current: Result };
    rerender: (props?: Props) => void;
    unmount: () => void;
    waitFor: <T>(callback: () => T | Promise<T>) => Promise<T>;
  };
  export function cleanup(): void;
  export function waitFor<T>(callback: () => T | Promise<T>, options?: { timeout?: number }): Promise<T>;
  export function act(callback: () => void | Promise<void>): Promise<void>;
  export const screen: RenderResult;
  export const fireEvent: {
    click(element: HTMLElement): void;
    change(element: HTMLElement, options: { target: { value: string } }): void;
    submit(element: HTMLElement): void;
    focus(element: HTMLElement): void;
    blur(element: HTMLElement): void;
    keyDown(element: HTMLElement, options: { key: string; code?: string }): void;
    keyUp(element: HTMLElement, options: { key: string; code?: string }): void;
    mouseEnter(element: HTMLElement): void;
    mouseLeave(element: HTMLElement): void;
  };
}
