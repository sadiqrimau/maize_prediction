const CREDENTIALS = [
  { username: 'admin',   password: 'imtisal2026' },
  { username: 'demo',    password: 'maize123'    },
  { username: 'imtisal', password: 'alhikmah2026'},
];

const AUTH_KEY = 'imtisal_auth_user';

export function login(username: string, password: string): boolean {
  const valid = CREDENTIALS.some(
    (c) => c.username === username.trim().toLowerCase() && c.password === password,
  );
  if (valid) localStorage.setItem(AUTH_KEY, username.trim().toLowerCase());
  return valid;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(AUTH_KEY);
}

export function getUser(): string | null {
  return localStorage.getItem(AUTH_KEY);
}
