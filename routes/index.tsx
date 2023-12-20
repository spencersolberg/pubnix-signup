import { listUsers } from "../utils/users.ts";
import { isHandshake } from "../utils/utils.ts";
import { getVerificationFromRequest } from "../utils/jwt.ts";
import Header from "../components/Header.tsx";

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
      <Header name={name} isHandshakeRequest={isHandshakeRequest} />
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