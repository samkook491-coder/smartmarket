export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return <div className="feedback error" role="alert">{children}</div>
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <div className="feedback notice">{children}</div>
}

export function Loading({ label = 'Chargement…' }: { label?: string }) {
  return <div className="loading-message" role="status">{label}</div>
}
