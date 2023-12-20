import * as jose from "jose";

type Verification = {
    name: string;
    authenticatorName?: string;
}

export const signToken = async (name: string, host = "localhost:8000", authenticatorName?: string): Promise<string> => {
    const privateKeyString = await Deno.readTextFile("./jwt.key");
    const privateKey = await jose.importPKCS8(privateKeyString, "RS256");

    const protocol = host.startsWith("localhost:") ? "http" : "https";

    const token = await new jose.SignJWT({
        authenticatorName
    })
        .setProtectedHeader({
            typ: "JWT",
            alg: "RS256"
        })
        .setIssuer(`${protocol}://${host}`)
        .setSubject(name)
        .setAudience(host)
        .setExpirationTime("1d")
        .setIssuedAt()
        .sign(privateKey);

    return token;
}

export const verifyToken = async (token: string): Promise<Verification> => {
    const publicKeyString = await Deno.readTextFile("./jwt.key.pub");
    const publicKey = await jose.importSPKI(publicKeyString, "RS256");

    try {
        const { payload } = await jose.jwtVerify(token, publicKey);

        const expiration: number = payload.exp!;
        const now = Math.floor(Date.now() / 1000);

        if (expiration < now) {
            throw new Error("Token expired");
        }

        const name = payload.sub!;
        const authenticatorName = payload.authenticatorName ? payload.authenticatorName as string : undefined;

        return { name, authenticatorName };
    } catch (_) {
        throw new Error("Invalid token");
    }
}

type UnsureVerification = {
    name?: string;
    authenticatorName?: string;

}

export const getVerificationFromRequest = async (request: Request): Promise<UnsureVerification> => {
    const { headers } = request;
    const cookie = headers.get("cookie");
    const token = cookie?.split("token=")[1]?.split(";")[0];

    if (!token) return {};

    try {
        const { name, authenticatorName } = await verifyToken(token);
        return { name, authenticatorName };
    } catch (_) {
        return {};
    }
}