import "$std/dotenv/load.ts";
import { runCommand } from "./utils.ts";

export const createUser = async (name: string): Promise<void> => {
    const actions: Promise<string | void>[] = [
        runCommand(`useradd -m -k /etc/skel -s /bin/bash ${name}`),
        runCommand(`passwd -d ${name}`),
        makeSshDirectory(name),
        runCommand(`chmod 700 /home/${name}/.ssh`),
        touchAuthorizedKeys(name),
        runCommand(`chmod 600 /home/${name}/.ssh/authorized_keys`),
        runCommand(`chown -R ${name}:${name} /home/${name}/.ssh`),
        appendTlsaRecord(name),
        generateCaddyFile(name),
        runCommand("systemctl restart coredns"),
        runCommand("systemctl reload caddy")
    ];

    for (const action of actions) {
        await action;
    };
}

export const deleteUser = async (name: string): Promise<void> => {
    const actions: Promise<string | void>[] = [
        runCommand(`userdel -r ${name}`),
        removeTlsaRecord(name),
        runCommand("systemctl restart coredns")
    ]

    for (const action of actions) {
        await action;
    }
}

export const listUsers = async (): Promise<string[]> => {
    const users = await runCommand("ls /home/");
    return users.split("\n").filter(user => user !== "");
}

export const addSshKey = async (name: string, key: string): Promise<void> => {
    const authorizedKeys = await Deno.readTextFile(`/home/${name}/.ssh/authorized_keys`);
    if (authorizedKeys.includes(key)) {
        throw new Error("Key already exists");
    }
    await Deno.writeTextFile(`/home/${name}/.ssh/authorized_keys`, `${authorizedKeys}\n${key}`);
}

export const removeSshKey = async (name: string, key: string): Promise<void> => {
    const authorizedKeys = await Deno.readTextFile(`/home/${name}/.ssh/authorized_keys`);
    if (!authorizedKeys.includes(key)) {
        throw new Error("Key does not exist");
    }
    await Deno.writeTextFile(`/home/${name}/.ssh/authorized_keys`, authorizedKeys.replace(key, ""));
}

export const listSshKeys = async (name: string): Promise<string[]> => {
    if (Deno.build.os !== "linux") {
        return ["foo", "bar"];
    }
    const authorizedKeys = await Deno.readTextFile(`/home/${name}/.ssh/authorized_keys`);
    return authorizedKeys.split("\n").filter(key => key !== "" && !key.startsWith("#"));
}

const appendTlsaRecord = async (name: string): Promise<void> => {
    const tlsa = `_443._tcp.${name} IN TLSA ${Deno.env.get("TLSA_RECORD")}`;
    const zoneFile = await Deno.readTextFile("/etc/coredns/zones/db.pubnix");
    if (!zoneFile.includes(tlsa)) {
        await Deno.writeTextFile("/etc/coredns/zones/db.pubnix", `${zoneFile}\n\n${tlsa}`);
    }
}

const removeTlsaRecord = async (name: string): Promise<void> => {
    const tlsa = `_443._tcp.${name} IN TLSA ${Deno.env.get("TLSA_RECORD")}`;
    const zoneFile = await Deno.readTextFile("/etc/coredns/zones/db.pubnix");
    if (zoneFile.includes(tlsa)) {
        await Deno.writeTextFile("/etc/coredns/zones/db.pubnix", zoneFile.replace(tlsa, ""));
    }
}

const generateCaddyFile = async (name: string): Promise<void> => {
    const caddyfile = `
${name}.pubnix.systems {
    root * /home/{http.request.host.labels.2}/public_html
	file_server
}`;
    await Deno.writeTextFile(`/etc/caddy/caddyfiles/${name}.pubnix.systems.Caddyfile`, caddyfile);

    try {
        await runCommand(`caddy validate -c /etc/caddy/caddyfiles/${name}.pubnix.systems.Caddyfile -a caddyfile`);
    } catch (error) {
        await Deno.remove(`/etc/caddy/caddyfiles/${name}.pubnix.systems.Caddyfile`);
        throw error;
    }
}

const makeSshDirectory = async (name: string): Promise<void> => {
    await Deno.mkdir(`/home/${name}/.ssh`);
}

const touchAuthorizedKeys = async (name: string): Promise<void> => {
    await Deno.create(`/home/${name}/.ssh/authorized_keys`);
}