"use client";

export function getVisitorId(): string {
  try {
    let id = localStorage.getItem("gb-visitor");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("gb-visitor", id);
    }
    return id;
  } catch {
    return "ephemeral-" + Math.random().toString(36).slice(2, 12);
  }
}
