/// <reference lib="deno.unstable" />

const kv = await Deno.openKv();

export const setChallenge = async (name: string, challenge: string): Promise<void> => {
    const res = await kv.get<string>(["challenges", name]);
    if (res.value) {
        throw new Error(`Challenge already exists for ${name}`);
    }
    await kv.set(["challenges", name], challenge, { expireIn: 5 * 60 * 1000 });
};

export const getChallenge = async (name: string): Promise<string> => {
    const res = await kv.get<string>(["challenges", name]);
    if (!res.value) {
        throw new Error(`No active challenge for ${name}`);
    }
    return res.value;
}

export const generateChallenge = (name: string): string => {
    const uuid = crypto.randomUUID();
    const challenge = `pubnix.${name}.${uuid}`;

    return challenge;
}