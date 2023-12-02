import { Handlers } from "$fresh/server.ts";
import "$std/dotenv/load.ts";

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

        const verifyUrl = `https://verify.spencersolberg.com/api/verify?name=${encodeURIComponent(name)}&message=${encodeURIComponent(key)}&signature=${encodeURIComponent(signature)}`;
        console.log(verifyUrl);

        const verifyResponse = await fetch(verifyUrl);
        const verification = await verifyResponse.json();

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