import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // 👈 ត្រូវបន្ថែមបន្ទាត់នេះ ដើម្បីឱ្យស្គាល់ .toBeInTheDocument()
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});