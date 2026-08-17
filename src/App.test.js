import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./services/socket", () => ({
  socket: {
    on: jest.fn(),
    off: jest.fn(),
    connect: jest.fn()
  }
}));

test("renders the live scores experience", () => {
  render(<App />);

  expect(screen.getByText(/Vê o jogo/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Basquetebol/i })).toBeInTheDocument();
  expect(screen.getByText(/A procurar resultados/i)).toBeInTheDocument();
});

test("allows changing the active sport", () => {
  render(<App />);
  const button = screen.getByRole("button", { name: /Basquetebol/i });

  fireEvent.click(button);

  expect(button).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("heading", { name: "Basquetebol" })).toBeInTheDocument();
});
