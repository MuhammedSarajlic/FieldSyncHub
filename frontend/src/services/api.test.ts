import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// SEC-20: the refresh endpoint now rotates and revokes the presented refresh
// token, so two 401s that each independently call the refresh endpoint race
// it - whichever loses is told its (already-rotated) token is revoked and
// signs the user out mid-session. These tests pin that N concurrent 401s
// share one refresh call and, whether it succeeds or fails, drive at most
// one outcome (one retried-batch or one sign-out) instead of N.
const { instanceMock, axiosPostMock, requestHandlers, responseHandlers } =
  vi.hoisted(() => {
    const requestHandlers: Array<{ onFulfilled: unknown; onRejected: unknown }> = [];
    const responseHandlers: Array<{ onFulfilled: unknown; onRejected: unknown }> = [];
    const instanceMock: any = vi.fn((config: unknown) =>
      Promise.resolve({ data: 'ok', config })
    );
    const axiosPostMock = vi.fn();
    return { instanceMock, axiosPostMock, requestHandlers, responseHandlers };
  });

vi.mock('axios', () => ({
  default: {
    create: () => {
      instanceMock.interceptors = {
        request: {
          use: (onFulfilled: unknown, onRejected: unknown) => {
            requestHandlers.push({ onFulfilled, onRejected });
          },
        },
        response: {
          use: (onFulfilled: unknown, onRejected: unknown) => {
            responseHandlers.push({ onFulfilled, onRejected });
          },
        },
      };
      return instanceMock;
    },
    post: axiosPostMock,
  },
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn() },
}));

import toast from 'react-hot-toast';
import './api';

const onRejected = responseHandlers[0].onRejected as (
  error: unknown
) => Promise<unknown>;

const makeFailingRequest = () => ({
  config: { headers: {}, url: '/reports/stat' },
  response: { status: 401 },
});

describe('api 401 response interceptor', () => {
  beforeEach(() => {
    instanceMock.mockClear();
    axiosPostMock.mockReset();
    (toast.error as any).mockClear();
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('accessToken', 'stale-token');
    // jsdom's window.location.assign isn't spy-able directly (non-configurable);
    // replace the whole object with one whose assign is a mock.
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { ...window.location, assign: vi.fn() },
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dedupes five concurrent 401s into a single refresh call and signs no one out', async () => {
    axiosPostMock.mockResolvedValue({ data: { accessToken: 'fresh-token' } });

    await Promise.all([
      onRejected(makeFailingRequest()),
      onRejected(makeFailingRequest()),
      onRejected(makeFailingRequest()),
      onRejected(makeFailingRequest()),
      onRejected(makeFailingRequest()),
    ]);

    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(instanceMock).toHaveBeenCalledTimes(5);
    expect(toast.error).not.toHaveBeenCalled();
    expect(window.location.assign).not.toHaveBeenCalled();
    expect(localStorage.getItem('accessToken')).toBe('fresh-token');
  });

  it('dedupes the sign-out when the shared refresh fails', async () => {
    axiosPostMock.mockRejectedValue(new Error('refresh token revoked'));

    const results = await Promise.allSettled([
      onRejected(makeFailingRequest()),
      onRejected(makeFailingRequest()),
      onRejected(makeFailingRequest()),
      onRejected(makeFailingRequest()),
      onRejected(makeFailingRequest()),
    ]);

    expect(results.every((result) => result.status === 'rejected')).toBe(true);
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(window.location.assign).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
