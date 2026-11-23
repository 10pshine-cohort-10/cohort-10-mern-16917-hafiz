import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { ThemeToggle } from './ThemeToggle';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="auth-page">
      <aside className="auth-hero">
        <div className="brand brand-light">
          <span className="brand-mark">
            <Icon name="note" size={20} />
          </span>
          <span>Notely</span>
        </div>
        <h2>Capture ideas. Stay organised. Think clearly.</h2>
        <ul className="feature-list">
          <li>
            <Icon name="sparkles" size={18} /> Rich text editing with formatting tools
          </li>
          <li>
            <Icon name="shield" size={18} /> Private notes, secured with JWT authentication
          </li>
          <li>
            <Icon name="zap" size={18} /> Instant search, pinning and colour labels
          </li>
        </ul>
      </aside>
      <section className="auth-panel">
        <div className="auth-toggle">
          <ThemeToggle />
        </div>
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  );
}
