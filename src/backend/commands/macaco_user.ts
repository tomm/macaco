import bcrypt from "bcrypt";
import { User, UserSerializer } from "../../common/macaco_common";
import { sql } from "../macaco_core";
import { v4 as uuidv4} from "uuid";

const ROUNDS = 10;

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

async function checkHash(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Returns guid */
export async function createUser(args: { email: string, password: string }): Promise<User> {
  const guid = uuidv4();
  const [user] = await sql`insert into users (guid, email, secret)
  values (${guid}, ${args.email}, ${await hashPassword(args.password)})
  returning *
  `;

  return UserSerializer.read(user);
}

/** Returns guid */
export async function checkUserLogin(args: { email: string, password: string }): Promise<User | undefined> {
  const [user] = await sql`select * from users where email=${args.email}`;
  if (user === undefined) return undefined;

  const isPasswordCorrect: boolean = await checkHash(args.password, user.secret);
  if (!isPasswordCorrect) return undefined;

  return UserSerializer.read(user);
}
