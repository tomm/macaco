import * as Safe from "safe-portals";

export const UserSerializer = Safe.obj({
  guid: Safe.uuid,
  email: Safe.str
});

export type User = Safe.TypeIn<typeof UserSerializer>;
