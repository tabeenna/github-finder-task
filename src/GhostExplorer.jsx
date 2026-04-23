import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Users, WifiOff } from 'lucide-react';

export default function GhostExplorer() {
  const [username, setUsername] = useState('your-username');
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBackOnline, setShowBackOnline] = useState(false);

  const hasMounted = useRef(false);
  const wasOffline = useRef(false);

  // EFFECTTT (koneksi online/offline)
  useEffect(() => {
    const handleStatus = () => {
      const currentStatus = navigator.onLine;
      setIsOnline(currentStatus);

      if (!currentStatus) {
        wasOffline.current = true;
      }
    };

    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // EFFECT (fetch data dgn abortcontroller)
  useEffect(() => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setUser(null);
      setError('');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`https://api.github.com/users/${trimmedUsername}`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'User tidak ditemukan');
        }

        setUser(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setUser(null);
          setError(err.message || 'Terjadi kesalahan');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [username]);

  // EFFECT (sinkron judul tab browser)
  useEffect(() => {
    if (user) {
      document.title = `Viewing: ${user.name || user.login}`;
    } else {
      document.title = 'GitHub Explorer';
    }
  }, [user]);

  // EFFECT (back online + timer)
  useEffect(() => {
    let timer;

    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (isOnline && wasOffline.current) {
      setShowBackOnline(true);

      timer = setTimeout(() => {
        setShowBackOnline(false);
      }, 2500);

      wasOffline.current = false;
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isOnline]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"></div>

      {showBackOnline && (
        <div className="fixed top-6 right-6 z-50 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 backdrop-blur-xl shadow-lg">
          <p className="font-semibold text-emerald-300">Back Online</p>
        </div>
      )}

      <div className="relative w-full max-w-4xl">
        <div
          className={`absolute top-0 left-0 h-1 w-full rounded-t-3xl ${
            isOnline ? 'bg-emerald-400/70' : 'bg-red-500 animate-pulse'
          }`}
        ></div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 md:p-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.3em] text-slate-400">
                Real-Time GitHub Finder
              </p>
              <h1 className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-4xl font-black text-transparent md:text-5xl">
                Ghost Explorer
              </h1>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                isOnline
                  ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-400/50 bg-red-500/10 text-red-300'
              }`}
            >
              {isOnline ? (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                  Online
                </>
              ) : (
                <>
                  <WifiOff size={16} />
                  Offline
                </>
              )}
            </div>
          </div>

          <div className="relative mb-8">
            <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Type GitHub username..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pr-4 pl-12 text-slate-100 outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-emerald-400/40 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            />
          </div>

          {loading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
              Loading profile...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && user && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:bg-white/10 md:p-8">
              <div className="flex flex-col items-start gap-6 md:flex-row">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="h-28 w-28 rounded-2xl border border-white/10 object-cover"
                />

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white md:text-3xl">
                    {user.name || user.login}
                  </h2>
                  <p className="mt-1 text-slate-400">@{user.login}</p>

                  {user.bio && (
                    <p className="mt-4 leading-relaxed text-slate-300">
                      {user.bio}
                    </p>
                  )}

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">
                        Followers
                      </p>
                      <p className="flex items-center gap-2 font-semibold">
                        <Users size={16} />
                        {user.followers}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">
                        Following
                      </p>
                      <p className="font-semibold">{user.following}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">
                        Repositories
                      </p>
                      <p className="font-semibold">{user.public_repos}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">
                        Location
                      </p>
                      <p className="flex items-center gap-2 font-semibold">
                        <MapPin size={16} />
                        {user.location || 'Not provided'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">
                        Profile
                      </p>
                      <a
                        href={user.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-cyan-300 transition-colors hover:text-cyan-200"
                      >
                        {user.html_url}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}