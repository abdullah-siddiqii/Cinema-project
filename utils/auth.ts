export function getAuthUser() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }
  return null;
}
