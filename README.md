

# Table of contents
1. [About](#about)
2. [Getting started](#getting-started)
3. [Account Creation](#account-creation)
4. [Encryption and decryption](#encryption-and-decryption)
## About <a name="about"></a>
Plusman is a password manager inspired by [Bitwarden](https://github.com/bitwarden/) that uses modern hashing and key derivation functions to secure your login information. Features end-to-end, zero-knowledge encryption.

## Getting Started <a name="getting-started"></a>
Install [Corepack](https://github.com/nodejs/corepack#readme) on your system:
```bash
npm install --global corepack@latest
```

Install [pnpm](https://pnpm.io/installation):
```bash
corepack enable pnpm
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Account Creation
A user creates an account using their email and a password with 12+ characters. With the email as a salt, a 256-bit master key is derived from the password using [Argon2id](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id) with 64 MiB of memory, 3 iterations, and 4 degrees of parallelism. This master key is used to encrypt a randomly generated 256-bit key which will be used to encrypt vault items.

The master key is hashed once again with the password as a salt and the same Argon2id parameteres. The resulting hash is sent to the server along with the email and encrypted vault key.

On the server-side, the master password is hashed again with the same Argon2id parameters before being saved to a new account with the email and encrypted vault key.

## Authentication

A master key is derived from the email and password, then hashed, in the same process as in [account creation](#account-creation). The hash is compared with that which is stored server-side. If the hash matches, the encrypted vault key for that account is sent to the client.

The encrypted vault key is decrypted with the master key. The vault key is then stored in memory as a non-extractable [CryptoKey](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey) to be used for viewing vault items. For this reason, the vault key is lost on reloading the page, forcing users to reauthenticate.

## Encryption and decryption

All data is encrypted with AES-256-GCM with 96-bit initialization vectors. AES-GCM provides both confidentiality and integrity— an authentication tag is added to the ciphertext so that on decryption, it can be verified that the data was not tampered with.

Each vault item field, e.g. website, username, password, note, is encrypted individually (except for the name of the vault item, which is not encrypted).