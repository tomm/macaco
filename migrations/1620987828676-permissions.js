exports.up = async function(sql) {
  await sql`
    create table roles (
      guid uuid primary key not null,
      name text not null unique,
      permissions text[] not null
    )`;

  await sql`
    create table user_roles (
      user_guid uuid not null references users(guid) on delete cascade,
      role_guid uuid not null references roles(guid) on delete cascade
    )`;

  await sql`
    create unique index user_roles_idx on user_roles(user_guid, role_guid)
  `;
};

exports.down = async function(sql) {
  await sql`drop table user_roles`;
  await sql`drop table roles`;
};
