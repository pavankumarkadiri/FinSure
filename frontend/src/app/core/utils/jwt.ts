export function decodeJwtSubject(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      sub?: string;
    };

    return decoded.sub ?? null;
  } catch {
    return null;
  }
}
