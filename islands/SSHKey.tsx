export default function SSHKey(props: { sshKey: string }) {
    return (<>
        <pre>{props.sshKey}</pre>
        <form action="/api/keys/remove" method="POST">
            <input type="hidden" name="key" value={props.sshKey} />
            <button type="submit">Remove</button>
        </form>
    </>)
}