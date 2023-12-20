import { verifyToken } from "../../utils/jwt.ts";

export const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const redirect = url.searchParams.get("redirect");

    if (!token) {
        const headers = new Headers();
        const { hostname: domain } = url;
        const secure = url.protocol === "https:";

        headers.set("Location", "/login");
        headers.set(
            "Set-Cookie",
            `token=; Path=/; HttpOnly;${secure && " Secure;"} SameSite=Strict; Domain=${domain};`
        );
        return new Response(null, {
            status: 303,
            headers
        });
    }

    try {
        await verifyToken(token);
    } catch (_) {
        const headers = new Headers();
        const { hostname: domain } = url;
        const secure = url.protocol === "https:";

        headers.set("Location", "/login");
        headers.set(
            "Set-Cookie",
            `token=; Path=/; HttpOnly;${secure && " Secure;"} SameSite=Strict; Domain=${domain};`
        );

        return new Response(null, {
            status: 303,
            headers
        });
    }

    const headers = new Headers();
    const { hostname: domain } = url;
    const secure = url.protocol === "https:";

    headers.set("Location", redirect || "/");
    headers.set(
        "Set-Cookie",
        `token=${token}; Path=/; HttpOnly;${secure && " Secure;"} SameSite=Strict; Domain=${domain};`
    );

    return new Response(null, {
        status: 303,
        headers
    });
}