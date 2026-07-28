// Fixed per-role color assignment so the same role reads the same way everywhere
// (Profile, UserDetails, Users table) instead of each place picking its own.
const ROLE_TONES = {
  owner: 'purple',
  manager: 'info',
  core_team: 'success',
  super_admin: 'danger'
};

export const getRoleTone = (role) => ROLE_TONES[role] || 'neutral';

export const getActiveTone = (isActive) => (isActive ? 'success' : 'neutral');
