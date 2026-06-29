import { ReactNode } from 'react'

interface LandingPageProps {
  sections: ReactNode[]
}

export default function LandingPage({ sections }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {sections.map((section, i) => (
        <div key={i}>{section}</div>
      ))}
    </div>
  )
}