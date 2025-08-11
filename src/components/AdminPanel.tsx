import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getAllEmailSignups, EmailSignup } from '../services/emailService';

const AdminPanel: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signups, setSignups] = useState<EmailSignup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        loadSignups();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSignups = async () => {
    try {
      setLoading(true);
      const data = await getAllEmailSignups();
      setSignups(data);
    } catch (err) {
      setError('Failed to load signups');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError('Failed to logout');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
              Swift to Hear - Email Signups
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 focus:outline-none focus:ring-accent-500 focus:border-accent-500"
                placeholder="admin@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 focus:outline-none focus:ring-accent-500 focus:border-accent-500"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 dark:bg-accent-700 hover:bg-accent-700 dark:hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-secondary-900 focus:ring-accent-500 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
                Email Signups
              </h1>
              <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                Swift to Hear - Admin Panel
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/guide"
                className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 mr-2"
              >
                Platform Guide
              </Link>
              <Link
                to="/admin/safety"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Safety Guidelines
              </Link>
              <span className="text-sm text-secondary-600 dark:text-secondary-400">
                Signed in as {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-800 dark:text-secondary-200 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-secondary-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-secondary-500 dark:text-secondary-400 truncate">
                  Total Signups
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-secondary-900 dark:text-secondary-100">
                  {signups.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Platform Features */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-secondary-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-secondary-900 dark:text-secondary-100">
                Platform Features
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-secondary-500 dark:text-secondary-400">
                Access and test platform functionality.
              </p>
            </div>
            
            <div className="border-t border-secondary-200 dark:border-secondary-700">
              <div className="px-4 py-5 sm:px-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  
                  {/* Dialectic Session Card */}
                  <Link 
                    to="/practice/create"
                    className="relative group bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-900 dark:to-primary-900 p-6 rounded-lg border border-accent-200 dark:border-accent-700 hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-accent-600 dark:bg-accent-500 text-white ring-4 ring-white dark:ring-secondary-800">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 group-hover:text-accent-600 dark:group-hover:text-accent-400">
                        Dialectic Session
                      </h3>
                      <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                        Launch a practice session with role-based guidance for Speaker, Listener, Scribe, and Observer.
                      </p>
                      <span className="mt-4 text-sm font-medium text-accent-600 dark:text-accent-400 group-hover:text-accent-500">
                        Start Session →
                      </span>
                    </div>
                  </Link>

                  {/* Platform Guide Card */}
                  <Link 
                    to="/admin/guide"
                    className="relative group bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 p-6 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-green-600 dark:bg-green-500 text-white ring-4 ring-white dark:ring-secondary-800">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 group-hover:text-green-600 dark:group-hover:text-green-400">
                        Platform Guide
                      </h3>
                      <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                        Comprehensive instructions and best practices for using the Swift to Hear platform effectively.
                      </p>
                      <span className="mt-4 text-sm font-medium text-green-600 dark:text-green-400 group-hover:text-green-500">
                        View Guide →
                      </span>
                    </div>
                  </Link>

                  {/* Safety Guidelines Card */}
                  <Link 
                    to="/admin/safety"
                    className="relative group bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-900 p-6 rounded-lg border border-red-200 dark:border-red-700 hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-red-600 dark:bg-red-500 text-white ring-4 ring-white dark:ring-secondary-800">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 group-hover:text-red-600 dark:group-hover:text-red-400">
                        Safety Guidelines
                      </h3>
                      <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                        Essential safety protocols and distress response guidelines for trauma-informed sessions.
                      </p>
                      <span className="mt-4 text-sm font-medium text-red-600 dark:text-red-400 group-hover:text-red-500">
                        View Guidelines →
                      </span>
                    </div>
                  </Link>

                  {/* Future Features Placeholder */}
                  <div className="relative bg-secondary-50 dark:bg-secondary-700 p-6 rounded-lg border border-secondary-200 dark:border-secondary-600 opacity-50">
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-secondary-400 dark:bg-secondary-600 text-white ring-4 ring-white dark:ring-secondary-800">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-secondary-500 dark:text-secondary-400">
                        Analytics Dashboard
                      </h3>
                      <p className="mt-2 text-sm text-secondary-400 dark:text-secondary-500">
                        Session metrics, completion rates, and user feedback analysis.
                      </p>
                      <span className="mt-4 text-sm font-medium text-secondary-400 dark:text-secondary-500">
                        Coming Soon
                      </span>
                    </div>
                  </div>



                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-secondary-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-secondary-900 dark:text-secondary-100">
                Recent Signups
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-secondary-500 dark:text-secondary-400">
                All email addresses that have signed up for the mailing list.
              </p>
            </div>
            
            {loading ? (
              <div className="px-4 py-8 text-center">
                <p className="text-secondary-600 dark:text-secondary-400">Loading signups...</p>
              </div>
            ) : signups.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-secondary-600 dark:text-secondary-400">No signups yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-secondary-200 dark:divide-secondary-700">
                {signups.map((signup) => (
                  <li key={signup.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-accent-100 dark:bg-accent-800 flex items-center justify-center">
                            <span className="text-accent-600 dark:text-accent-300 font-medium">
                              {signup.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                                               <div className="ml-4">
                         <div className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                           {signup.email}
                         </div>
                         <div className="text-sm text-secondary-500 dark:text-secondary-400">
                           {formatDate(signup.createdAt)}
                         </div>
                         <div className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                           {signup.involvementLevel === 'get-involved' ? 'Wants to get involved' : 'Keep updated'}
                         </div>
                       </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          signup.status === 'confirmed' 
                            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                            : signup.status === 'unsubscribed'
                            ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                            : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {signup.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 