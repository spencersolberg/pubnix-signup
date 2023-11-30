export default async function Home() {
  const users = await getUsers();
  return (
    <>
      <h1>pubnix/</h1>
      <h2>Home</h2>

      <nav>
        <ul>
          <li>
            <a href="/signup">Signup</a>
          </li>
        </ul>
      </nav>

      <p>Users:</p>
      <ul>
        {users.map(user => (<>
          <li>
            <a href={`https://${user}.pubnix`}>{user}/</a>
          </li>
        </>))}
      </ul>
    </>
  );
}

const getUsers = async (): Promise<string[]> => {
    // load list of users from /home directory
    const users: string[] = [];
    for await (const entry of Deno.readDir("/home")) {
      users.push(entry.name);
    }

    return users;
}