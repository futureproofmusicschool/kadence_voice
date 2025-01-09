import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ConfigForm from '../ConfigForm';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SessionProvider } from '../../contexts/SessionContext';

const server = setupServer(
    rest.post('http://localhost:8000/config', (req, res, ctx) => {
        return res(ctx.json({ session_id: 'mock_session_id', token: 'mock_token' }));
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renders ConfigForm and submits data', async () => {
    const mockSetSessionData = jest.fn();
    render(
        <SessionProvider value={{ setSessionData: mockSetSessionData }}>
            <ConfigForm />
        </SessionProvider>
    );

    userEvent.selectOptions(screen.getByLabelText(/voice/i), 'Puck');
    userEvent.type(screen.getByLabelText(/api key/i), 'test_api_key');

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
        expect(mockSetSessionData).toHaveBeenCalledWith({ session_id: 'mock_session_id', token: 'mock_token' });
    });
});