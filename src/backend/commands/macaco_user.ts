import { User, UserSerializer } from "@common/macaco_common";
import bcrypt from "bcrypt";
import * as Safe from "safe-portals";
import { v4 as uuidv4 } from "uuid";
import { sql } from "../macaco_core";

const ROUNDS = 10;

async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, ROUNDS);
}

async function checkHash(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}

/** Returns guid */
export async function createUser(args: { email: string; password: string }): Promise<User> {
    const guid = uuidv4();
    const [user] = await sql`insert into users (guid, email, secret)
  values (${guid}, ${args.email}, ${await hashPassword(args.password)})
  returning *
  `;

    return UserSerializer.read(user);
}

/** Returns guid */
export async function checkUserLogin(args: { email: string; password: string }): Promise<User | undefined> {
    const [user] = await sql`select * from users where email=${args.email}`;
    if (user === undefined) return undefined;

    const isPasswordCorrect: boolean = await checkHash(args.password, user.secret);
    if (!isPasswordCorrect) return undefined;

    return UserSerializer.read(user);
}

export async function upsertRole(args: { name: string; guid: string; permissions: string[] }): Promise<void> {
    await sql`insert into roles (name, guid, permissions)
    values (${args.name}, ${args.guid}, ${sql.array(args.permissions)}::text[])
  on conflict (guid) do update
    set permissions=${sql.array(args.permissions)}::text[]`;
}

export async function getRolePermissions(guid: string): Promise<string[] | undefined> {
    return sql`select permissions from roles where guid=${guid}`.then(
        (r) => r[0] ? Safe.array(Safe.str).read(r[0].permissions) : undefined,
    );
}

export async function addUserRole(args: { user_guid: string; role_guid: string }): Promise<void> {
    await sql`insert into user_roles (user_guid, role_guid)
  values (${args.user_guid}, ${args.role_guid})
  on conflict (user_guid, role_guid) do nothing`;
}

export async function removeUserRole(args: { user_guid: string; role_guid: string }): Promise<void> {
    await sql`delete from user_roles where user_guid=${args.user_guid} and role_guid=${args.role_guid}`;
}

/**
 * @returns a list of the user's permissions OR undefined if user not found
 */
export async function getUserPermissions(user_guid: string): Promise<Set<string> | undefined> {
    const rows = await sql`select
    exists (select 1 from users where guid=${user_guid}) as user_found,
    (
      select array_agg(permissions) as perms from user_roles ur
      join roles r on r.guid=ur.role_guid
      where ur.user_guid=${user_guid}
    )`;

    return rows[0].user_found ? new Set((rows[0].perms || []).flat(1)) : undefined;
}

export function getMissingPermissions(args: { needed: Set<string>; has: Set<string> }): Set<string> {
    if (args.has.has("superuser")) {
        return new Set();
    } else {
        const missing = new Set(
            [...Array.from(args.needed)].filter(x => !args.has.has(x)),
        );
        return missing;
    }
}
