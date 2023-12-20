import { deleteUser } from "../../../utils/users.ts";
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

        try {
            await deleteUser(name);
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