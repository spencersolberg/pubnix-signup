import { getVerificationFromRequest } from "../utils/jwt.ts";
import { FreshContext } from "$fresh/server.ts";
import { listSshKeys } from "../utils/users.ts";
import SSHKey from "../islands/SSHKey.tsx";

export default async function Account(req: Request, ctx: FreshContext) {
    const { name } = await getVerificationFromRequest(req);

    if (!name) {
        return ctx.renderNotFound();
    }

    const sshKeys = await listSshKeys(name);

    return (<>
        <h1>pubnix/</h1>
        <hr />
        <p>Logged in as {name}/</p>
        <nav>
            <ul>
                <li>
                    <a href={`https://${name}.pubnix`}>Your Page</a>
                </li>
                <li>
                    <a href="/logout">Logout</a>
                </li>
            </ul>
        </nav>
        <hr />
        <h2>Account</h2>
        <h3>SSH Keys</h3>
        <ul>
            {sshKeys.map((key) => <li><SSHKey sshKey={key} /></li>)}
        </ul>
        <form action="/api/keys/add" method="POST">
            <label htmlFor="key">Key</label>
            <br />
            <textarea name="key" />
            <br />
            <br />
            <button type="submit">Add</button>
        </form>
        <h3>Delete Account</h3>
        <p>This will delete your account and all of your data</p>
        <form action="/api/account/delete" method="POST">
            <button type="submit">Delete</button>
        </form>
    </>)
}