import { getApiUrl } from './services/api';

describe('api module', () => {
  it('should have a getApiUrl function', () => {
    expect(typeof getApiUrl).toBe('function');
  });

  it('should return a string from getApiUrl', () => {
    const url = getApiUrl();
    expect(typeof url).toBe('string');
  });
});