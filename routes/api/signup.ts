import { Handlers } from "$fresh/server.ts";
import "$std/dotenv/load.ts";
import { NodeClient } from "hs-client";
import { client } from "https://esm.sh/v135/bcurl@0.2.1/denonext/bcurl.mjs";

type Verification = {
    success: boolean;
    error?: string;
}

export const handler: Handlers = {
    GET(_req) {
        return new Response(null, {
            status: 301,
            headers: {
                location: "/",
            },
        });
    },
    async POST(req) {
        const form = await req.formData();
        const nameValue = form.get("name");
        const keyValue = form.get("key");
        const signatureValue = form.get("signature");

        if (!nameValue || !keyValue || !signatureValue) {
            return new Response("Missing parameters", {
                status: 400,
            });
        }

        const name = (nameValue as string).toLowerCase();
        const key = keyValue as string;
        const signature = signatureValue as string;

        const clientOptions = {
            host: "127.0.0.1",
            port: 12037
        }

        const client = new NodeClient(clientOptions);

        // const verifyUrl = `https://verify.spencersolberg.com/api/verify?name=${encodeURIComponent(name)}&message=${encodeURIComponent(key)}&signature=${encodeURIComponent(signature)}`;
        // console.log(verifyUrl);

        // const verifyResponse = await fetch(verifyUrl);
        // const verification = await verifyResponse.json();

        let verification: Verification;

        try {
            const result = await client.execute("verifymessagewithname", [name, signature, key]);

            verification = {
                success: true
            }
        } catch (e) {
            verification = {
                success: false,
                error: e
            }
        }

        if (!verification.success) {
            return new Response(null, {
                status: 301,
                headers: {
                    location: "/failure"
                }
            
            })
        }

        try {
            await createUser(name, key);

            return new Response(null, {
                status: 301,
                headers: {
                    location: `/success?name=${encodeURIComponent(name as string)}`
                }
            })
        } catch (e) {
            console.error(e);
            return new Response(null, {
                status: 301,
                headers: {
                    location: "/failure"
                }
            })
        }
    }
}

const createUser = async (name: string, key: string): Promise<void> => {
    console.log(`Creating user ${name}`);
    const commands = [
        `useradd -m -k /etc/skel -s /bin/bash ${name}`,
        `passwd -d ${name}`,
        `mkdir /home/${name}/.ssh`,
        `chmod 700 /home/${name}/.ssh`,
        `touch /home/${name}/.ssh/authorized_keys`,
    ];

    for (const command of commands) {
        await runCommand(command);
    }

    // write key to authorized_keys file
    const authorizedKeys = Deno.readTextFileSync(`/home/${name}/.ssh/authorized_keys`);
    Deno.writeTextFileSync(`/home/${name}/.ssh/authorized_keys`, `${authorizedKeys}\n${key}`);

    const moreCommands = [
        `chmod 600 /home/${name}/.ssh/authorized_keys`,
        `chown -R ${name}:${name} /home/${name}/.ssh`,
    ]

    for (const command of moreCommands) {
        await runCommand(command);
    }

    // append TLSA DNS record for subdomain
    const tlsa = `_443._tcp.${name} IN TLSA ${Deno.env.get("TLSA_RECORD")}`;
    const zoneFile = await Deno.readTextFile("/etc/coredns/zones/db.pubnix");
    if (!zoneFile.includes(tlsa)) {
        Deno.writeTextFileSync("/etc/coredns/zones/db.pubnix", `${zoneFile}\n\n${tlsa}`);
    }

    // restart coredns
    await runCommand("systemctl restart coredns");
}

const runCommand = async (command: string): Promise<void> => {
    const program = command.split(" ")[0];
    const args = command.split(" ").slice(1);
    const cmd = new Deno.Command(program, { args});
    const { code, stdout: _stdout, stderr } = await cmd.output();
    if (code !== 0) {
        throw new Error(new TextDecoder().decode(stderr));
    }
}