import { deleteUser } from "../../../utils/users.ts";
import { Handlers } from "$fresh/server.ts";
import { getVerificationFromRequest } from "../../../utils/jwt.ts";
import { getDomains, removeDomain } from "../../../utils/kv.ts";
import { disconnectDomain } from "../../../utils/domain.ts";

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

        try {
            await deleteUser(name);
            const connections = await getDomains(name);
            for (const connection of connections) {
                await disconnectDomain(connection);
                await removeDomain(name, connection.domain);
            }
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
                location: "/"
            }
        });
    }
}