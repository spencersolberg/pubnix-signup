import * as jose from "jose";

const { publicKey, privateKey } = await jose.generateKeyPair("RS256", { extractable: true });

const publicKeyString = await jose.exportSPKI(publicKey);
const privateKeyString = await jose.exportPKCS8(privateKey);

const publicJWK = await jose.exportJWK(publicKey);

const jwks = {
    keys: [
        {
            ...publicJWK,
            use: "sig",
            kid: crypto.randomUUID(),
            alg: "RS256",
            key_ops: [ "verify" ]
        }
    ]
}

await Promise.all([
    Deno.writeTextFile("./jwt.key", privateKeyString),
    Deno.writeTextFile("./jwt.key.pub", publicKeyString),
    Deno.writeTextFile("./jwks.json", JSON.stringify(jwks, undefined, 4))
]);