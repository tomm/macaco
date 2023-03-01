import assert from "assert";
import baretest from "baretest";
import * as uuid from "uuid";
import * as UserCmd from "./macaco_user";
import { sql } from "./sql";

const test = baretest("Macaco User");

test("Create user and check passwords", async () => {
    await sql`delete from users`;

    const user = await UserCmd.createUser({ email: "test@example.com", password: "testpassword" });

    assert.deepEqual(
        await UserCmd.checkUserLogin({ email: user.email, password: "testpassword" }),
        { email: "test@example.com", guid: user.guid },
    );

    assert.strictEqual(
        await UserCmd.checkUserLogin({ email: user.email, password: "wrong password" }),
        undefined,
    );
});

test("upsertRole(), getRolePermissions()", async () => {
    await sql`delete from roles`;
    const guid = uuid.v4();
    assert.deepEqual(undefined, await UserCmd.getRolePermissions(guid));
    await UserCmd.upsertRole({ name: "role1", guid, permissions: ["foo", "bar"] });
    assert.deepEqual(["foo", "bar"], await UserCmd.getRolePermissions(guid));
    await UserCmd.upsertRole({ name: "role1", guid, permissions: ["foo", "baz"] });
    assert.deepEqual(["foo", "baz"], await UserCmd.getRolePermissions(guid));
});

test("Resolve user permissions", async () => {
    await sql`delete from users`;
    await sql`delete from roles`;

    // user does not exist
    assert.deepEqual(undefined, await UserCmd.getUserPermissions(uuid.v4()));

    const role1_guid = uuid.v4();
    const role2_guid = uuid.v4();
    await UserCmd.upsertRole({ name: "role1", guid: role1_guid, permissions: ["foo", "bar"] });
    await UserCmd.upsertRole({ name: "role2", guid: role2_guid, permissions: ["bar", "gob"] });

    const user = await UserCmd.createUser({ email: "test@example.com", password: "testpassword" });
    assert.deepEqual(new Set([]), await UserCmd.getUserPermissions(user.guid));

    await UserCmd.addUserRole({ user_guid: user.guid, role_guid: role1_guid });
    assert.deepEqual(new Set(["foo", "bar"]), await UserCmd.getUserPermissions(user.guid));

    await UserCmd.addUserRole({ user_guid: user.guid, role_guid: role2_guid });
    assert.deepEqual(new Set(["foo", "bar", "gob"]), await UserCmd.getUserPermissions(user.guid));

    await UserCmd.removeUserRole({ user_guid: user.guid, role_guid: role1_guid });
    assert.deepEqual(new Set(["bar", "gob"]), await UserCmd.getUserPermissions(user.guid));
});

test("Figure out what permissions are missing", async () => {
    assert.deepEqual(
        UserCmd.getMissingPermissions({
            needed: new Set(["one", "two", "three", "four"]),
            has: new Set(["two", "three"]),
        }),
        new Set(["one", "four"]),
    );

    assert.deepEqual(
        UserCmd.getMissingPermissions({
            needed: new Set(["one", "two", "three", "four"]),
            has: new Set(["superuser"]),
        }),
        new Set([]),
    );

    assert.deepEqual(
        UserCmd.getMissingPermissions({
            needed: new Set(["one", "two"]),
            has: new Set(["one", "two", "three", "four"]),
        }),
        new Set([]),
    );
});

export default test;
