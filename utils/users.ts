import "$std/dotenv/load.ts";
import { runCommand } from "./utils.ts";

export const createUser = async (name: string): Promise<void> => {
    await runCommand(`useradd -m -k /etc/skel -s /bin/bash ${name}`);
    await runCommand(`passwd -d ${name}`);
    await makeSshDirectory(name);
    await runCommand(`chmod 700 /home/${name}/.ssh`);
    await touchAuthorizedKeys(name);
    await runCommand(`chmod 600 /home/${name}/.ssh/authorized_keys`);
    await runCommand(`chown -R ${name}:${name} /home/${name}/.ssh`);
    await appendTlsaRecord(name);
    await generateCaddyFile(name);
    await runCommand("systemctl restart coredns");
    await runCommand("systemctl reload caddy");
}

export const deleteUser = async (name: string): Promise<void> => {
    await runCommand(`userdel -r ${name}`);
    await removeTlsaRecord(name);
    await removeCaddyFile(name);
    await runCommand("systemctl restart coredns");
    await runCommand("systemctl reload caddy");
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

const removeCaddyFile = async (name: string): Promise<void> => {
    await Deno.remove(`/etc/caddy/caddyfiles/${name}.pubnix.systems.Caddyfile`);
}

const makeSshDirectory = async (name: string): Promise<void> => {
    await Deno.mkdir(`/home/${name}/.ssh`, { recursive: true });
}

const touchAuthorizedKeys = async (name: string): Promise<void> => {
    await Deno.create(`/home/${name}/.ssh/authorized_keys`);
}