import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';

const PRESETS = [
  {
    role: 'admin',
    title: 'Admin Account',
    badge: 'Admin',
    name: 'Admin User',
    email: 'admin@shopflow.com',
    password: 'Admin@1234',
    icon: ShieldCheck,
  },
  {
    role: 'customer',
    title: 'Customer (Alice)',
    badge: 'Customer',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Customer@123',
    icon: User,
  },
  {
    role: 'customer',
    title: 'Customer (Bob)',
    badge: 'Customer',
    name: 'Bob Martinez',
    email: 'bob@example.com',
    password: 'Customer@123',
    icon: User,
  },
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: 'admin@shopflow.com', password: 'Admin@1234' });
  const [activePreset, setActivePreset] = useState('admin@shopflow.com');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectPreset = (preset) => {
    setForm({ email: preset.email, password: preset.password });
    setActivePreset(preset.email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}! (${data.user.role})`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">🛒</div>
          <h1 className="auth-title">ShopFlow Portal</h1>
          <p className="auth-subtitle">Sign in to your account (Admin or Customer)</p>
        </div>

        {/* Quick account presets */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
            Quick Select Account
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {PRESETS.map((p) => {
              const Icon = p.icon;
              const isSelected = activePreset === p.email;
              return (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={16} />
                  <span>{p.badge}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                    {p.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="email"
                style={{ paddingLeft: 38 }}
                value={form.email}
                onChange={e => {
                  setForm({ ...form, email: e.target.value });
                  setActivePreset(e.target.value);
                }}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type={showPw ? 'text' : 'password'}
                style={{ paddingLeft: 38, paddingRight: 38 }}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' }}>
            Demo Accounts Available
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-accent" style={{ marginRight: 6 }}>Admin</span>
                <span style={{ color: 'var(--text-secondary)' }}>admin@shopflow.com</span>
              </div>
              <code style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin@1234</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-info" style={{ marginRight: 6 }}>Customer</span>
                <span style={{ color: 'var(--text-secondary)' }}>alice@example.com</span>
              </div>
              <code style={{ fontSize: 11, color: 'var(--text-muted)' }}>Customer@123</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-info" style={{ marginRight: 6 }}>Customer</span>
                <span style={{ color: 'var(--text-secondary)' }}>bob@example.com</span>
              </div>
              <code style={{ fontSize: 11, color: 'var(--text-muted)' }}>Customer@123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
