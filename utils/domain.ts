import "$std/dotenv/load.ts";
import { runCommand } from "./utils.ts";

export type DomainConnection = {
    domain: string;
    records: Record[];
    keyFile: string;
}

type Record = WalletRecord | DNSRecord;

type WalletRecord = {
    kind: "wallet";
    type: "NS" | "DS";
    value: string;
}

export type DNSRecord = {
    kind: "dns";
    type: "A" | "AAAA" | "TLSA";
    domain: string;
    value: string;
}

export const connectDomain = async (domain: string): Promise<DomainConnection> => {
    const tlsaRecord = await generateCertificates(domain);
    await createZoneFile(domain, tlsaRecord);

    const keyFile = await generateDnssecKey(domain);
    await generateCorefile(domain, keyFile);
    const dsRecord = await generateDsRecord(domain, keyFile);

    await generateCaddyfile(domain);

    await restartCoredns();
    await reloadCaddy();

    const records: Record[] = [
        { kind: "wallet", type: "NS", value: Deno.env.get("NS") ?? "" },
        { kind: "wallet", type: "DS", value: dsRecord },
        { kind: "dns", type: "A", domain, value: Deno.env.get("A") ?? "" },
        { kind: "dns", type: "AAAA", domain, value: Deno.env.get("AAAA") ?? "" },
        { kind: "dns", type: "TLSA", domain: `_443._tcp.${domain}`, value: tlsaRecord },
    ];

    return { domain, records, keyFile };
};

const generateCertificates = async (domain: string): Promise<string> => {
    await runCommand("bash certificates.sh", { DOMAIN: domain });
    return runCommand("bash tlsa.sh", { DOMAIN: domain });
}

const createZoneFile = async (domain: string, tlsaRecord: string): Promise<void> => {
    const zoneFile = `
$TTL 3600
@ IN SOA  ${Deno.env.get("NS")} ${domain}.pubnix. (
        2023010101 ; serial
        3600       ; refresh (1 hour)
        1800       ; retry (30 minutes)
        604800     ; expire (1 week)
        3600       ; minimum (1 hour)
        )
    IN NS   ${Deno.env.get("NS")}
    IN A    ${Deno.env.get("A")}
    IN AAAA ${Deno.env.get("AAAA")}

_443._tcp IN TLSA ${tlsaRecord}`;
    await Deno.writeTextFile(`/etc/coredns/zones/db.${domain}`, zoneFile);
}

const generateDnssecKey = async (domain: string): Promise<string> => {
    return await runCommand(`dnssec-keygen -a ECDSAP256SHA256 -K /etc/coredns/keys ${domain}`);
}

const generateCorefile = async (domain: string, keyFile: string): Promise<void> => {
    const corefile = `
${domain} {
    bind ${Deno.env.get("INTERFACE")}
    file zones/db.${domain}
    dnssec {
        key file keys/${keyFile}
    }
}`;

    await Deno.writeTextFile(`/etc/coredns/corefiles/${domain}.Corefile`, corefile);
}

const generateDsRecord = async (domain: string, keyFile: string): Promise<string> => {
    const output = await runCommand(`dnssec-dsfromkey -a SHA-256 /etc/coredns/keys/${keyFile}.key`);
    const dsRecord = output.replace(`${domain}. IN DS `, "").trim();

    return dsRecord;
}

const generateCaddyfile = async (domain: string): Promise<void> => {
    const caddyfile = `
${domain} {
    root * /home/${domain}/public_html
    file_server

    tls /etc/ssl/certs/${domain}.crt /etc/ssl/private/${domain}.key
}`;

    await Deno.writeTextFile(`/etc/caddy/caddyfiles/${domain}.Caddyfile`, caddyfile);

    try {
        await runCommand(`caddy validate -c /etc/caddy/caddyfiles/${domain}.Caddyfile -a caddyfile`);
    } catch (error) {
        await Deno.remove(`/etc/caddy/caddyfiles/${domain}.Caddyfile`);
        throw error;
    }
}

const restartCoredns = async (): Promise<void> => {
    await runCommand("systemctl restart coredns");
}

const reloadCaddy = async (): Promise<void> => {
    await runCommand("systemctl reload caddy");
}

const removeCertificates = async (domain: string): Promise<void> => {
    await Deno.remove(`/etc/ssl/certs/${domain}.crt`);
    await Deno.remove(`/etc/ssl/private/${domain}.key`);
}

const removeZoneFile = async (domain: string): Promise<void> => {
    await Deno.remove(`/etc/coredns/zones/db.${domain}`);
}

const removeDnssecKey = async (keyfile: string): Promise<void> => {
    await Deno.remove(`/etc/coredns/keys/${keyfile}.key`);
    await Deno.remove(`/etc/coredns/keys/${keyfile}.private`);
}

const removeCorefile = async (domain: string): Promise<void> => {
    await Deno.remove(`/etc/coredns/corefiles/${domain}.Corefile`);
}

const removeCaddyfile = async (domain: string): Promise<void> => {
    await Deno.remove(`/etc/caddy/caddyfiles/${domain}.Caddyfile`);
}

export const disconnectDomain = async (connection: DomainConnection): Promise<void> => {
    const { domain, keyFile } = connection;
    const actions: Promise<void>[] = [
        removeCertificates(domain),
        removeZoneFile(domain),
        removeDnssecKey(keyFile),
        removeCorefile(domain),
        removeCaddyfile(domain),
        restartCoredns(),
        reloadCaddy()
    ];

    for (const action of actions) {
        await action;
    }
}