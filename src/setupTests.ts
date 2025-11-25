// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock pdfjs-dist to avoid ES module issues in Jest
jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn(),
  GlobalWorkerOptions: {
    workerSrc: '',
  },
  version: '5.4.149',
}));

// Mock PDF worker setup functions globally
// This must be done before any imports
jest.mock('./utils/pdfWorkerSetup', () => ({
  configurePDFWorker: jest.fn(),
  configurePDFWorkerLocal: jest.fn(),
  configurePDFWorkerLegacy: jest.fn(),
  configurePDFWorkerAuto: jest.fn(),
  checkPDFWorkerCompatibility: jest.fn(() => true),
  testPDFWorker: jest.fn(async () => true),
}));
