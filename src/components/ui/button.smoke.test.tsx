import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

/**
 * Smoke test confirming the Vitest "jsdom" project renders React components
 * via React Testing Library and resolves the `@/*` path alias. Replace/remove
 * once real component tests exist (e.g. for SeatMap in task 22).
 */
describe('vitest jsdom project toolchain', () => {
  it('renders a real src/ component and responds to interaction', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
