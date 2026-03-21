import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axiosClient from '../../api/axiosClient';

describe('api/axiosClient', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have correct baseURL', () => {
    expect(axiosClient.defaults.baseURL).toBeDefined();
  });

  it('should not overwrite Authorization header if already set', async () => {
    const config = { headers: { Authorization: 'Bearer existing-token' } };
    // Get the request interceptor
    const requestInterceptor = axiosClient.interceptors.request.handlers[0].fulfilled;
    const result = await requestInterceptor(config);
    expect(result.headers.Authorization).toBe('Bearer existing-token');
  });

  it('should add Authorization header from localStorage', async () => {
    const mockState = { state: { token: 'mock-token-from-storage' } };
    localStorage.setItem('greenlife-auth', JSON.stringify(mockState));

    const config = { headers: {} };
    const requestInterceptor = axiosClient.interceptors.request.handlers[0].fulfilled;
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBe('Bearer mock-token-from-storage');
  });

  it('should not crash if localStorage contains invalid JSON', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('greenlife-auth', 'invalid-json');

    const config = { headers: {} };
    const requestInterceptor = axiosClient.interceptors.request.handlers[0].fulfilled;
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should pass through successful responses', async () => {
    const responseInterceptor = axiosClient.interceptors.response.handlers[0].fulfilled;
    const response = { data: 'ok' };
    const result = await responseInterceptor(response);
    expect(result).toBe(response);
  });

  it('should handle API errors and log them', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const responseInterceptorError = axiosClient.interceptors.response.handlers[0].rejected;
    const error = { response: { status: 401, data: 'Unauthorized' } };
    
    await expect(responseInterceptorError(error)).rejects.toEqual(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith("API Error:", "Unauthorized");
  });
  
  it('should handle API errors without response data gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const responseInterceptorError = axiosClient.interceptors.response.handlers[0].rejected;
    const error = { message: 'Network Error' };
    
    await expect(responseInterceptorError(error)).rejects.toEqual(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith("API Error:", "Network Error");
  });
});
