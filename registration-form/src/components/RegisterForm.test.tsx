import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "./RegisterForm";
import { ChakraProvider } from "@chakra-ui/react";

const mockInterests = [
  { id: "sports", name: "Sports" },
  { id: "music", name: "Music" },
  { id: "dancing", name: "Dancing" },
  { id: "games", name: "Games" },
];

const mockFetch = jest.spyOn(global, "fetch");

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe("RegisterForm", () => {
  beforeEach(() => {
    mockFetch.mockClear();

    mockFetch.mockImplementation((url) => {
      if (url.toString().includes("/interests")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInterests),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);
    });
  });

  afterAll(() => {
    mockFetch.mockRestore();
  });

  test("renders Step 1 fields initially", async () => {
    renderWithChakra(<RegisterForm />);

    expect(
      screen.getByRole("heading", { name: /Register/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Names/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Interests \(Max 2\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText(/Sports/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/Music/i)).toBeInTheDocument();
    });
  });

  test("shows validation errors for Step 1 fields on Next click", async () => {
    renderWithChakra(<RegisterForm />);

    userEvent.click(screen.getByRole("button", { name: /Next/i }));

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Password must be at least 6 characters/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Please confirm your password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Please select at least one interest/i)
    ).toBeInTheDocument();
  });
});
