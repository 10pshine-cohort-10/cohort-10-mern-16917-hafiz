import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import { isValidEmail, passwordStrength } from '../utils/format';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export default function Signup() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const strength = passwordStrength(password);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (!isValidEmail(email)) next.email = 'Enter a valid email address';
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      next.password = 'Use 8+ characters with at least one letter and one number';
    }
    if (confirm !== password) next.confirm = 'Passwords do not match';
    return next;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await signup(name.trim(), email.trim(), password);
      toast.success('Account created. Welcome aboard!');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not create your account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start organising your notes in seconds.">
      <form onSubmit={handleSubmit} noValidate className="form">
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Hafiz M Faizan" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          {password && (
            <div className="strength" aria-live="polite">
              <div className="strength-bars">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={n <= strength.score ? `on level-${strength.score}` : ''} />
                ))}
              </div>
              <span className="muted small">{strength.label}</span>
            </div>
          )}
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>
        <div className="field">
          <label htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" />
          {errors.confirm && <span className="field-error">{errors.confirm}</span>}
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthShell>
  );
}
