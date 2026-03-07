/**
 * Test: UI Interaction
 * Verifies that the chat widget opens/closes when the toggle button is clicked,
 * and that the name input form is displayed correctly.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock BroadcastChannel for jsdom
class MockBroadcastChannel {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage() {}
  close() {}
}
global.BroadcastChannel = MockBroadcastChannel as unknown as typeof BroadcastChannel;

// Mock crypto.randomUUID
Object.defineProperty(global, "crypto", {
  value: { randomUUID: () => "00000000-0000-0000-0000-000000000000" },
});

import { ChatWidget } from "@/components/visitor/ChatWidget";

describe("ChatWidget UI Interaction", () => {
  it("opens and closes the chat widget when the toggle button is clicked", () => {
    render(<ChatWidget />);

    // Widget should be closed initially
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click the toggle button to open
    const toggleButton = screen.getByLabelText("Open chat");
    fireEvent.click(toggleButton);

    // Widget dialog should now be visible
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Welcome!")).toBeInTheDocument();
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();

    // Click again to close
    const closeButton = screen.getByLabelText("Close chat");
    fireEvent.click(closeButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
