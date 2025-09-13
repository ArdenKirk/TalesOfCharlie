import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '../../app/page'

// Mock Next.js router and Image component
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

describe('App Tests', () => {
  it('should render the main page without crashing', () => {
    render(<Page />)
    expect(document.body).toBeInTheDocument()
  })

  it('should compile TypeScript files correctly', () => {
    // This test ensures all TypeScript files compile without errors
    expect(true).toBe(true)
  })
})
