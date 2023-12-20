/// <reference lib="deno.unstable" />

import { DomainConnection } from "./domain.ts";

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
};

export const removeChallenge = async (name: string): Promise<void> => {
    await kv.delete(["challenges", name]);
};

export const generateChallenge = (name: string): string => {
    const uuid = crypto.randomUUID();
    const challenge = `pubnix.${name}.${uuid}`;

    return challenge;
};

export const addDomain = async (name: string, connection: DomainConnection): Promise<void> => {
    const res = await kv.get<DomainConnection[]>(["domains", name]);
    if (res.value?.find(c => c.domain === connection.domain)) {
        throw new Error(`Domain ${connection.domain} already exists for ${name}`);
    }

    const connections = res.value ?? [];
    connections.push(connection);

    await kv.set(["domains", name], connections);
}

export const removeDomain = async (name: string, domain: string): Promise<void> => {
    const res = await kv.get<DomainConnection[]>(["domains", name]);
    if (!res.value) {
        throw new Error(`No domain ${domain} for ${name}`);
    }

    const connections = res.value.filter(c => c.domain !== domain);
    await kv.set(["domains", name], connections);
}

export const getDomains = async (name: string): Promise<DomainConnection[]> => {
    const res = await kv.get<DomainConnection[]>(["domains", name]);
    return res.value ?? [];
}

export const getDomain = async (name: string, domain: string): Promise<DomainConnection> => {
    const res = await kv.get<DomainConnection[]>(["domains", name]);
    if (!res.value) {
        throw new Error(`No domain ${domain} for ${name}`);
    }

    const connection = res.value.find(c => c.domain === domain);
    if (!connection) {
        throw new Error(`No domain ${domain} for ${name}`);
    }

    return connection;
}