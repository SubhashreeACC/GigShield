// Auth helpers — localStorage-based user management for MVP
const USERS_KEY = 'gs_registered_users';
const CURRENT_USER_KEY = 'gs_current_user';
const ADMIN_KEY = 'gs_admin_session';

// --- User Registration & Login ---

/** Get all registered users */
export function getRegisteredUsers() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Register a new user */
export function registerUser(userData) {
  const users = getRegisteredUsers();

  // Check for duplicate phone/email
  const exists = users.find(
    u => u.phone === userData.phone || (userData.email && u.email === userData.email)
  );
  if (exists) {
    throw new Error('User with this phone or email already exists');
  }

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...userData,
    role: 'user',
    onboarded: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
}

/** Login with phone/email + password. Returns user or throws. */
export function loginUser(identifier, password) {
  const users = getRegisteredUsers();
  const user = users.find(
    u =>
      (u.phone === identifier || u.email === identifier) &&
      u.password === password
  );

  if (!user) {
    // Check if identifier exists but password wrong
    const existsButWrongPass = users.find(
      u => u.phone === identifier || u.email === identifier
    );
    if (existsButWrongPass) {
      throw new Error('Invalid password. Please try again.');
    }
    throw new Error('UNREGISTERED');
  }

  // Save session
  const session = { ...user };
  delete session.password;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));
  localStorage.setItem('gs_token', user.phone);
  return session;
}

/** Login with phone only (OTP flow) */
export function loginWithPhone(phone) {
  const users = getRegisteredUsers();
  const user = users.find(u => u.phone === phone);

  if (!user) {
    throw new Error('UNREGISTERED');
  }

  const session = { ...user };
  delete session.password;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));
  localStorage.setItem('gs_token', phone);
  return session;
}

/** Get current logged-in user */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch {
    return null;
  }
}

/** Logout */
export function logoutUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('gs_token');
}

/** Check if user is logged in */
export function isLoggedIn() {
  return !!getCurrentUser();
}

// --- Admin Auth ---
const ADMIN_CREDENTIALS = {
  email: 'admin@gigshield.in',
  password: 'admin123',
};

/** Admin login */
export function adminLogin(email, password) {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const adminSession = {
      id: 'admin_001',
      name: 'GigShield Admin',
      email,
      role: 'admin',
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminSession));
    return adminSession;
  }
  throw new Error('Invalid admin credentials');
}

/** Get admin session */
export function getAdminSession() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(ADMIN_KEY));
  } catch {
    return null;
  }
}

/** Admin logout */
export function adminLogout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_KEY);
}

/** Check if admin is logged in */
export function isAdminLoggedIn() {
  return !!getAdminSession();
}
