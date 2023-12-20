import { removeDomain, getDomain } from "../../../utils/kv.ts";
import { disconnectDomain } from "../../../utils/domain.ts";
import { getVerificationFromRequest } from "../../../utils/jwt.ts";
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
    GET() {
        return new Response(null, {
            status: 303,
            headers: {
                location: "/"
            },
        });
    },
    async POST(req: Request) {
        const { name } = await getVerificationFromRequest(req);

        if (!name) {
            return new Response(null,{
                status: 401,
                headers: {
                    location: "/login"
                },
            });
        }

        const form = await req.formData();
        const domain = form.get("domain");

        if (!domain) {
            return new Response("Missing parameters", {
                status: 400,
            });
        }

        try {
            const connection = await getDomain(name, domain as string);
            await disconnectDomain(connection);
            await removeDomain(name, domain as string);
        } catch (error) {
            return new Response(null, {
                status: 400,
                headers: {
                    location: `/failure?error=${encodeURIComponent(error.message)}`
                },
            });
        }

        return new Response(null, {
            status: 303,
            headers: {
                location: "/account"
            }
        });
    }
}