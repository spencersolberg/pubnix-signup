import { Handlers } from "$fresh/server.ts";
import { getChallenge } from "../../../utils/kv.ts";
import { verifyMessage } from "../../../utils/hsd.ts";
import { signToken } from "../../../utils/jwt.ts";

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
        let name = form.get("name");
        let signature = form.get("signature");

        if (!name || !signature) {
            return new Response("Missing parameters", {
                status: 400,
            });
        }

        name = (name as string).toLowerCase();
        signature = signature as string;

        let challenge: string;

        try {
            challenge = await getChallenge(name);
        } catch (error) {
            const failureUrl = `/failure?error=${encodeURIComponent(error.message)}`;
            return new Response(null, {
                status: 301,
                headers: {
                    location: failureUrl,
                },
            });
        }

        const verifyResponse = await verifyMessage(name, signature, challenge);

        if (!verifyResponse.success) {
            const failureUrl = `/failure?error=${encodeURIComponent(verifyResponse.error!.message)}`;
            return new Response(null, {
                status: 301,
                headers: {
                    location: failureUrl,
                },
            });
        }

        const token = await signToken(name);
        const setTokenurl = `/auth/set-token?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent("/")}`;
        return new Response(null, {
            status: 303,
            headers: {
                location: setTokenurl,
            },
        });
    }
}