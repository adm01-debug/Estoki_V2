import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
  },
}));

describe("Authentication Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render login form", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Auth />
        </AuthProvider>
      </MemoryRouter>
    );
    // AuthProvider resolves its initial getSession asynchronously, so the page
    // shows a loading spinner first and the form mounts on the next tick.
    expect(await screen.findByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
  });

  it("should call supabase signInWithPassword on form submit", async () => {
    const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValueOnce({ data: { user: { id: "123" } } as any, error: null });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Auth />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(await screen.findByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /^entrar$/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});
