export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function accountKey(userId: string, feature: string, day?: string) {
  return `@zencademy:v2:${userId}:${feature}${day ? ':' + day : ''}`;
}
