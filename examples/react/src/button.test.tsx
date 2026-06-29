import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button label="Save" onClick={() => undefined} />);
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn<() => void>();
    render(<Button label="Save" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
