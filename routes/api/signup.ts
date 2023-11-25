import { Handlers } from "$fresh/server.ts";

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
        const name = form.get("name");
        const key = form.get("key");
        const signature = form.get("signature");

        if (!name || !key || !signature) {
            return new Response("Missing parameters", {
                status: 400,
            });
        }

        const verifyUrl = `https://verify.spencersolberg.com/api/verify?name=${encodeURIComponent(name as string)}&message=${encodeURIComponent(key as string)}&signature=${encodeURIComponent(signature as string)}`;
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
            await createUser(name as string, key as string);

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
        `/usr/sbin/useradd -m -k /etc/skel ${name}`,
        `/usr/bin/passwd -d ${name}`,
        `/usr/bin/mkdir /home/${name}/.ssh`,
        `/usr/bin/chmod 700 /home/${name}/.ssh`,
        `/usr/bin/echo "${key}" | /usr/bin/tee /home/${name}/.ssh/authorized_keys`,
        `/usr/bin/chmod 600 /home/${name}/.ssh/authorized_keys`,
        `/usr/bin/chown -R ${name}:${name} /home/${name}/.ssh`,
    ];

    for (const command of commands) {
        const cmd = new Deno.Command(command);
        const { code, stdout: _stdout, stderr } = await cmd.output();
        if (code !== 0) {
            throw new Error(new TextDecoder().decode(stderr));
        }
    }

    
}