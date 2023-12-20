export default function Header(props: { name: string | undefined, isHandshakeRequest: boolean}) {
    return (<>
        {props.name ? <>
        <hr />
        <p>Logged in as {props.name}/</p>
        <nav>
          <ul>
            <li>
                <a href="/">Home</a>
            </li>
            <li>
              <a href={props.isHandshakeRequest ? `https://${props.name}.pubnix` : `https://${props.name}.pubnix.systems`}>Your Page</a>
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
    </>)
}