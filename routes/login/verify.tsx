import { RouteContext } from "$fresh/server.ts";
import { getChallenge } from "../../utils/kv.ts";
import Challenge from "../../islands/Challenge.tsx";
import VerifyForm from "../../islands/VerifyForm.tsx";

export default async function Verify(req: Request, ctx: RouteContext) {
    const url = new URL(req.url);
    const name = url.searchParams.get("name");

    if (!name) {
        return ctx.renderNotFound();
    }

    let challenge: string;

    try {
        challenge = await getChallenge(name);
    } catch (e) {
        console.error(e);
        return ctx.renderNotFound();
    }

    return (<>
        <h1>pubnix/</h1>
        <h2>Verify</h2>

        <p>To verify ownership of your domain {name}/, please sign the following challenge:</p>
        <Challenge challenge={challenge} />
        <VerifyForm name={name} challenge={challenge} action="/api/login/verify"/>
    </>)
}