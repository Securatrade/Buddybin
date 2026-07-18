export function canAccessCustomerProfile({
  authUserId,
  profileAuthUserId,
}: {
  authUserId: string | null | undefined;
  profileAuthUserId: string | null | undefined;
}) {
  return Boolean(authUserId && profileAuthUserId && authUserId === profileAuthUserId);
}

export function canCreateContactMessage({
  authUserId,
  profileAuthUserId,
  profileId,
  customerPlanProfileId,
}: {
  authUserId: string | null | undefined;
  profileAuthUserId: string | null | undefined;
  profileId: string;
  customerPlanProfileId: string;
}) {
  return (
    canAccessCustomerProfile({ authUserId, profileAuthUserId }) &&
    profileId === customerPlanProfileId
  );
}
