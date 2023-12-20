import { addDomain } from "../../../utils/kv.ts";
import { connectDomain } from "../../../utils/domain.ts";
import { Handlers } from "$fresh/server.ts";
import { getVerificationFromRequest } from "../../../utils/jwt.ts";

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

        if (domain !== name) {
            return new Response("Domain must be the same as your username", {
                status: 400,
            });
        }

        try {
            const connection = await connectDomain(domain as string)
            await addDomain(name, connection);
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