import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportButton } from "../ExportButton";
import * as sentry from "@/lib/sentry";

vi.mock("@/lib/sentry", () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

describe("ExportButton — telemetria de erro", () => {
  it("registra breadcrumb de start em cada exportação", async () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ExportButton onExport={onExport} formats={["csv"]} />);
    await user.click(screen.getByRole("button", { name: /exportar/i }));
    await user.click(await screen.findByText(/Exportar CSV/i));
    await waitFor(() => expect(sentry.addBreadcrumb).toHaveBeenCalled());
    const startCall = (sentry.addBreadcrumb as unknown as { mock: { calls: unknown[][] } })
      .mock.calls.find((c) => String(c[1]).includes("start"));
    expect(startCall?.[0]).toBe("export");
  });

  it("chama captureException quando onExport lança", async () => {
    // Envolvemos o onExport para que a rejeição seja consumida pelo próprio
    // teste — o handler do ExportButton propositalmente re-lança o erro para
    // que o caller possa reagir (toast, etc.), mas em ambiente de teste isso
    // gera um unhandledrejection cosmético que polui o output.
    const boom = new Error("PDF boom");
    const onExport = vi.fn().mockImplementation(async () => {
      throw boom;
    });
    const suppress = (e: PromiseRejectionEvent) => {
      if (e.reason === boom) e.preventDefault();
    };
    window.addEventListener("unhandledrejection", suppress);
    const user = userEvent.setup();
    render(<ExportButton onExport={onExport} formats={["pdf"]} />);
    await user.click(screen.getByRole("button", { name: /exportar/i }));
    await user.click(await screen.findByText(/Exportar PDF/i));
    await waitFor(() => expect(sentry.captureException).toHaveBeenCalled());
    const [err, ctx] = (sentry.captureException as unknown as {
      mock: { calls: [unknown, Record<string, unknown>][] };
    }).mock.calls[0];
    expect(err).toBe(boom);
    expect(ctx).toMatchObject({ format: "pdf", source: "ExportButton" });
    window.removeEventListener("unhandledrejection", suppress);
  });
});
