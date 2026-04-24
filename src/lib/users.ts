import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_PATH = path.join(DATA_DIR, "users.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_PATH);
  } catch {
    await fs.writeFile(USERS_PATH, "[]\n", "utf8");
  }
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureStore();
  const raw = await fs.readFile(USERS_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredUser[];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]) {
  await ensureStore();
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2) + "\n", "utf8");
}

export async function getAllUsers() {
  return await readUsers();
}

export async function findUserByEmail(email: string) {
  const e = email.trim().toLowerCase();
  const users = await readUsers();
  return users.find((u) => u.email.toLowerCase() === e) || null;
}

export async function createUser(
  name: string,
  email: string,
  hashedPassword: string
) {
  const users = await readUsers();
  const e = email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === e)) {
    throw new Error("Email already registered.");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: e,
    hashedPassword,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeUsers(users);
  return user;
}

export async function updateUserPassword(email: string, hashedPassword: string) {
  const users = await readUsers();
  const e = email.trim().toLowerCase();
  const idx = users.findIndex((u) => u.email.toLowerCase() === e);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], hashedPassword };
  await writeUsers(users);
  return users[idx];
}

