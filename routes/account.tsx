import { getVerificationFromRequest } from "../utils/jwt.ts";
import { FreshContext } from "$fresh/server.ts";
import { listSshKeys } from "../utils/users.ts";
import SSHKey from "../islands/SSHKey.tsx";
import Header from "../components/Header.tsx";
import { isHandshake } from "../utils/utils.ts";

export default async function Account(req: Request, ctx: FreshContext) {
    const { name } = await getVerificationFromRequest(req);

    if (!name) {
        return ctx.renderNotFound();
    }

    const isHandshakeRequest = isHandshake(req);

    const sshKeys = await listSshKeys(name);

    return (<>
        <h1>pubnix/</h1>
        <Header name={name} isHandshakeRequest={isHandshakeRequest} />
        <h2>Account</h2>
        <h3>SSH Keys</h3>
        <p>Once you've configured your SSH key(s), you can connect with one of the following commands:</p>
        <pre>ssh {name}@pubnix</pre>
        <pre>ssh {name}@pubnix.systems</pre>
        <hr />
        <ul>
            {sshKeys.map((key) => <li><SSHKey sshKey={key} /></li>)}
        </ul>
        <form action="/api/keys/add" method="POST">
            <label htmlFor="key">Add SSH Key:</label>
            <br />
            <textarea name="key" placeholder="ssh-rsa AAAA...." />
            <br />
            <button type="submit">Add</button>
        </form>
        <a href="https://tilde.club/wiki/ssh.html#how-to-make-an-ssh-key" target="_blank" rel="noreferrer">No SSH key?</a>
        <h3>Delete Account</h3>
        <p>This will delete your account and all of your data</p>
        <form action="/api/account/delete" method="POST">
            <button type="submit">Delete</button>
        </form>
    </>)
}