// Simple admin auth — credentials checked client-side.
// For production, replace with a real backend auth (NextAuth, JWT, etc.)

const ADMIN_EMAIL = 'admin@kedos.in';
const ADMIN_PASSWORD = 'Admin@123';
const AUTH_KEY = 'kedos_admin_auth';

export function adminLogin(email: string, password: string): boolean {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(AUTH_KEY, 'true');
    }
    return true;
  }
  return false;
}

export function adminLogout(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(AUTH_KEY);
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}
