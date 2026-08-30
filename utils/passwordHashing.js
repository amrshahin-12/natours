const argon2 = require('argon2');

const HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, //2 ** 16 = 65536 KiB = 64 MiB
  timeCost: 3, //Number of iterations/passes the algorithm runs internally
  parallelism: 1,
};

exports.hash = (plainPassword) => argon2.hash(plainPassword, HASH_OPTIONS);
// exports.verify = (hash, plainPassword) => argon2.verify(hash, plainPassword);
