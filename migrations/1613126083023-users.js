exports.up = async function(sql) {
    await sql`
    create table users (
      guid uuid primary key not null,
      email text not null unique,
      secret text
    )
  `;
};

exports.down = async function(sql) {
    await sql`
    drop table users;
  `;
};
