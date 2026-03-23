/**
 * Whether the logged-in manager/owner can update or delete this user from the Users module.
 * Backend enforces the same rules; this is for UX (hide actions when not allowed).
 */
export function canManageUserRecord(actor, target) {
  const targetId = target?._id ?? target?.id;
  if (!actor?.id || !targetId) return false;
  if (String(actor.id) === String(targetId)) return false;
  if (target.role === 'owner') return false;
  if (actor.role === 'owner') return ['manager', 'core team'].includes(target.role);
  if (actor.role === 'manager') return target.role === 'core team';
  return false;
}
