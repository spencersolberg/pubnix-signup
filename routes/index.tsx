import { listUsers } from "../utils/users.ts";
import { isHandshake } from "../utils/utils.ts";
import { getVerificationFromRequest } from "../utils/jwt.ts";

export default async function Home(req: Request) {
  const { name } = await getVerificationFromRequest(req);

  let users: string[];
  try {
    users = await listUsers();
  } catch (e) {
    console.error(e);
    users = [];
  }

  const isHandshakeRequest = isHandshake(req);

  return (
    <>
      <h1>pubnix/</h1>
      {name ? <>
        <hr />
        <p>Logged in as {name}/</p>
        <nav>
          <ul>
            <li>
              <a href={isHandshakeRequest ? `https://${name}.pubnix` : `https://${name}.pubnix.systems`}>Your Page</a>
            </li>
            <li>
              <a href="/account">Account</a>
            </li>
            <li>
              <a href="/logout">Logout</a>
            </li>
          </ul>
        </nav>
        <hr />
      </> : <>
        <hr />
        <p>Not logged in</p>
        <nav>
          <ul>
            <li>
              <a href="/login">Login</a>
            </li>
            <li>
              <a href="/signup">Signup</a>
            </li>
          </ul>
        </nav>
        <hr />
      </>}
      <h2>Home</h2>

      <p>Users:</p>
      <ul>
        {users.map(user => (<>
          <li>
            <a href={isHandshakeRequest ? `https://${user}.pubnix` : `https://${user}.pubnix.systems`}>{user}/</a>
          </li>
        </>))}
      </ul>
    </>
  );
}