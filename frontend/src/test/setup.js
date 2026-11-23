import '@testing-library/jest-dom';

// Comprehensive in-memory localStorage mock for Vitest / jsdom environment
const createLocalStorageMock = () => {
  let store = {};
  return {
    getItem: (key) => (store[key] !== undefined ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i) => Object.keys(store)[i] || null,
  };
};

if (typeof window !== 'undefined') {
  const mockStorage = createLocalStorageMock();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true,
  });
  if (typeof global !== 'undefined') {
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  }
  if (window.HTMLElement && !window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = () => {};
  }
}
