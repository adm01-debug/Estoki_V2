import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportButton } from "../../src/components/ImportExport/ExportButton";

vi.mock("@/lib/sentry", () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

describe("ExportButton — cenário de erro", () => {
  it("chama captureException quando onExport lança", async () => {
    const sentry = await import("@/lib/sentry");
    const onExport = vi.fn().mockRejectedValue(new Error("PDF boom"));
    const user = userEvent.setup();
    render(<ExportButton onExport={onExport} formats={["pdf"]} />);
    await user.click(screen.getByRole("button", { name: /exportar/i }));
    await user.click(await screen.findByText(/Exportar PDF/i));
    await waitFor(() => expect(sentry.captureException).toHaveBeenCalled());
    const args = (sentry.captureException as any).mock.calls[0];
    expect(args[0]).toBeInstanceOf(Error);
    expect(args[1]).toMatchObject({ format: "pdf", source: "ExportButton" });
  });
});
