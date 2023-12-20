export const handler = (req: Request): Response => {
    const headers = new Headers();
    const url = new URL(req.url);
    const { hostname: domain } = url;
    const secure = url.protocol === "https:";

    headers.set("Location", "/");
    headers.set(
        "Set-Cookie",
        `token=; Path=/; HttpOnly;${secure && " Secure;"} SameSite=Strict; Domain=${domain};`
    );
    
    return new Response(null, {
        status: 303,
        headers
    });
}