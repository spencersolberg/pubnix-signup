import { RouteContext } from "$fresh/server.ts";

export default function Success(req: Request, _ctx: RouteContext) {
    const url = new URL(req.url);
    const params = url.searchParams;
    const name = params.get("name");

    return (<>
    <h1>pubnix/</h1>
    <h2>Success</h2>

    <p>Your account has been created</p>

    <p>You can now log in with:</p>
    
    <pre>ssh {name}@pubnix</pre>

    <a href="/">Back to home</a>
    </>);
}