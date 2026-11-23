import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icon';
import { greeting } from '../utils/format';

export default function Home() {
  const { user } = useAuth();

  return (
    <section className="empty">
      <div className="empty-icon">
        <Icon name="sparkles" size={32} />
      </div>
      <h1>
        {greeting()}, {user?.name.split(' ')[0]} 👋
      </h1>
      <p className="muted">You are signed in. Your notes dashboard arrives in the next release.</p>
    </section>
  );
}
