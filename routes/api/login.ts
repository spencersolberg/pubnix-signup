import { Handlers } from "$fresh/server.ts";
import { setChallenge, getChallenge, generateChallenge } from "../../utils/kv.ts";
import { listUsers } from "../../utils/users.ts";

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

        if (!nameValue) {
            return new Response("Missing name", {
                status: 400,
            });
        }

        const name = (nameValue as string).toLowerCase();
        let users: string[];
        try {
            users = await listUsers();
        } catch (error) {
            console.error(error);
            return new Response(null, {
                status: 500,
            });
        }

        if (Deno.build.os === "linux" && !users.includes(name)) {
            return new Response(null, {
                status: 303,
                headers: {
                    location: "/signup",
                },
            });
        }

        let challenge: string;
        let isNewChallenge = false;
        try {
            challenge = await getChallenge(name);
        } catch (_) {
            challenge = generateChallenge(name);
            isNewChallenge = true;
        }

        try {
            if (isNewChallenge) await setChallenge(name, challenge);
            const verifyUrl = `/login/verify?name=${encodeURIComponent(name)}`;
            return new Response(null, {
                status: 301,
                headers: {
                    location: verifyUrl,
                },
            });
        } catch (error) {
            console.log(error);
            const failureUrl = `/failure?error=${encodeURIComponent(error.message)}`;
            return new Response(null, {
                status: 301,
                headers: {
                    location: failureUrl,
                },
            });
        }
    }
}