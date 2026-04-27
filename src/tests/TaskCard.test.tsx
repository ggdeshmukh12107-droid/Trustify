import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../features/trust/components/TaskCard';
import type { TrustTask } from '../types';

const mockTask: TrustTask = {
    id: 'test-1',
    title: 'Test Task',
    description: 'A test task description for testing purposes in unit tests.',
    freelancer: 'GAHTJDZ7NKQPKBKIQULQBQF6ADUHB3IXIFRJPJUSJFPWPKSJYDWVGLM',
    targetScore: 1000,
    trustScore: 350,
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    endorsements: [],
};

describe('TaskCard', () => {
    it('renders the task title', () => {
        render(<TaskCard task={mockTask} onEndorse={vi.fn()} isConnected />);
        expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('renders the task description', () => {
        render(<TaskCard task={mockTask} onEndorse={vi.fn()} isConnected />);
        expect(screen.getByText(/A test task description/)).toBeInTheDocument();
    });

    it('shows "Pending Verification" badge for active tasks', () => {
        render(<TaskCard task={mockTask} onEndorse={vi.fn()} isConnected />);
        expect(screen.getByText('Pending Verification')).toBeInTheDocument();
    });

    it('shows endorse button when wallet connected', () => {
        render(<TaskCard task={mockTask} onEndorse={vi.fn()} isConnected />);
        expect(screen.getByText('Verify & Endorse')).toBeInTheDocument();
    });

    it('shows lock message when wallet not connected', () => {
        render(<TaskCard task={mockTask} onEndorse={vi.fn()} isConnected={false} />);
        expect(screen.getByText('🔒 Connect to Endorse')).toBeInTheDocument();
    });

    it('endorse button is disabled when not connected', () => {
        render(<TaskCard task={mockTask} onEndorse={vi.fn()} isConnected={false} />);
        const btn = screen.getByRole('button', { name: /connect to endorse/i });
        expect(btn).toBeDisabled();
    });

    it('calls onEndorse when endorse button clicked', async () => {
        const onEndorse = vi.fn();
        render(<TaskCard task={mockTask} onEndorse={onEndorse} isConnected />);
        await userEvent.click(screen.getByText('Verify & Endorse'));
        expect(onEndorse).toHaveBeenCalledWith(mockTask);
    });

    it('shows loading overlay when isLoading', () => {
        render(<TaskCard task={mockTask} onEndorse={vi.fn()} isConnected isLoading />);
        expect(screen.getByText('Processing Endorsement...')).toBeInTheDocument();
    });

    it('shows endorsements count', () => {
        render(<TaskCard task={mockTask} onEndorse={vi.fn()} isConnected />);
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('Endorsements')).toBeInTheDocument();
    });

    it('shows "Closed" badge for expired task', () => {
        const ended: TrustTask = { ...mockTask, deadline: Date.now() - 1000 };
        render(<TaskCard task={ended} onEndorse={vi.fn()} isConnected />);
        expect(screen.getByText('Closed')).toBeInTheDocument();
    });
});
