'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { switchInstructor } from '@/app/actions/authActions';
import { authClient } from '@/lib/auth/client';
import { GraduationCap, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface Instructor {
  id: string;
  name: string;
  email: string;
  role: string;
  courses: { id: string; name: string; code: string }[];
}

export default function SignInClient({ instructors }: { instructors: Instructor[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'select' | 'magic'>('select');
  const [email, setEmail] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSelectInstructor = async (instructorId: string) => {
    setIsPending(true);
    setStatusMessage(null);
    try {
      await switchInstructor(instructorId);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to switch instructor' });
      setIsPending(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsPending(true);
    setStatusMessage(null);

    try {
      const res = await (authClient as any).signIn?.magicLink?.({
        email,
        callbackURL: window.location.origin,
      });

      if (res?.error) {
        setStatusMessage({ type: 'error', text: res.error.message || 'Failed to send magic link.' });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Magic link sent to ${email}! Check your inbox to sign in.`,
        });
      }
    } catch (err: any) {
      // Fallback: match email to instructor in database
      const found = instructors.find((i) => i.email.toLowerCase() === email.toLowerCase());
      if (found) {
        await switchInstructor(found.id);
        router.push('/');
        router.refresh();
        return;
      }
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error communicating with Neon Auth server. Please select your instructor profile below.',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Instructor Access Portal</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Secure, zero-cost authentication backed by Neon Postgres Auth and Lakebase.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('select')}
            className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'select'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Select Instructor Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('magic')}
            className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'magic'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" /> Neon Auth Magic Link
          </button>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm flex items-start gap-3 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/70 border-rose-800/80 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div>{statusMessage.text}</div>
          </div>
        )}

        {/* Profile Selector Tab */}
        {activeTab === 'select' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Select an authorized instructor to enter your dashboard:
            </p>
            <div className="grid grid-cols-1 gap-3.5">
              {instructors.map((inst) => (
                <button
                  key={inst.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSelectInstructor(inst.id)}
                  className="w-full text-left p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 hover:border-indigo-500/50 transition-all flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-base">
                      {inst.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base group-hover:text-indigo-300 transition">
                          {inst.name}
                        </span>
                        {inst.role === 'ADMIN' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{inst.email}</div>
                      <div className="text-[11px] text-slate-500 mt-1 flex gap-2">
                        {inst.courses.map((c) => (
                          <span key={c.id} className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                            {c.code}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-600/20 transition">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Magic Link Tab */}
        {activeTab === 'magic' && (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Instructor Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="indika.perera@instructorlms.edu"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? 'Authenticating...' : 'Sign In with Magic Link'}
              <Sparkles className="w-4 h-4" />
            </button>
            <p className="text-xs text-center text-slate-500">
              Neon Auth will verify your identity via email OTP or one-time token without needing passwords.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
