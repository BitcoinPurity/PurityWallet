import React from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react-native';
import { checkLegacyUtxos, LegacyUtxoResults } from '../../blue_modules/legacy-chain';
import { useLegacyUtxoCheck } from '../../hooks/useLegacyUtxoCheck';
import LegacyReplayWarning from '../../components/LegacyReplayWarning';
import loc from '../../loc';

jest.mock('../../blue_modules/legacy-chain', () => ({ checkLegacyUtxos: jest.fn() }));
jest.mock('../../components/themes', () => ({
  useTheme: () => ({ colors: { redBG: '#ffe0e0', redText: '#c00', alternativeTextColor: '#777' } }),
}));

const mockCheck = jest.mocked(checkLegacyUtxos);
const coin = { txid: 'a'.repeat(64), vout: 0, value: 50000, address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' };
const key = `${coin.txid}:0`;

beforeEach(() => mockCheck.mockReset());

it('shows pending checks and then the per-output results', async () => {
  let complete!: (results: LegacyUtxoResults) => void;
  mockCheck.mockReturnValue(new Promise(resolve => (complete = resolve)));
  const { result } = renderHook(() => useLegacyUtxoCheck([coin]));
  expect(result.current).toEqual({ checking: true, results: {} });
  await act(async () => complete({ [key]: 'shared' }));
  expect(result.current).toEqual({ checking: false, results: { [key]: 'shared' } });
});

it('discards a late response for an old selection', async () => {
  let oldComplete!: (results: LegacyUtxoResults) => void;
  mockCheck.mockReturnValueOnce(new Promise(resolve => (oldComplete = resolve)));
  mockCheck.mockResolvedValueOnce({ [`${coin.txid}:1`]: 'absent' });
  const { result, rerender } = renderHook(({ coins }) => useLegacyUtxoCheck(coins), { initialProps: { coins: [coin] } });
  rerender({ coins: [{ ...coin, vout: 1 }] });
  await waitFor(() => expect(result.current.results).toEqual({ [`${coin.txid}:1`]: 'absent' }));
  await act(async () => oldComplete({ [key]: 'shared' }));
  expect(result.current).toEqual({ checking: false, results: { [`${coin.txid}:1`]: 'absent' } });
});

it('refreshes on focus changes even when the selected inputs stay the same', async () => {
  mockCheck.mockResolvedValueOnce({ [key]: 'shared' }).mockResolvedValueOnce({ [key]: 'absent' });
  const { result, rerender } = renderHook(({ refresh }) => useLegacyUtxoCheck([coin], refresh), { initialProps: { refresh: 'first' } });
  await waitFor(() => expect(result.current.results[key]).toBe('shared'));
  rerender({ refresh: 'second' });
  await waitFor(() => expect(result.current.results[key]).toBe('absent'));
});

it('keeps failed checks distinct from absence', async () => {
  mockCheck.mockResolvedValue({ [key]: 'unknown' });
  const { result } = renderHook(() => useLegacyUtxoCheck([coin]));
  await waitFor(() => expect(result.current.checking).toBe(false));
  expect(result.current.results[key]).toBe('unknown');
});

it('shows a prominent alert for a shared Coin Control output', () => {
  const screen = render(<LegacyReplayWarning status="shared" />);
  expect(screen.getByRole('alert').props.children).toBe(loc.cc.legacy_shared);
});

it('shows the full replay warning in Send', () => {
  const screen = render(<LegacyReplayWarning status="shared" detailed />);
  expect(screen.getByText(loc.send.legacy_replay_warning)).toBeTruthy();
});

it('shows pending and unknown states without a safety claim', () => {
  const screen = render(<LegacyReplayWarning status="checking" />);
  expect(screen.getByText(loc.cc.legacy_checking)).toBeTruthy();
  screen.rerender(<LegacyReplayWarning status="unknown" detailed />);
  expect(screen.getByText(loc.send.legacy_check_failed)).toBeTruthy();
  screen.rerender(<LegacyReplayWarning status="absent" />);
  expect(screen.toJSON()).toBeNull();
});
