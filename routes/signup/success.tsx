export default function Success(req: Request) {
    const url = new URL(req.url);
    const params = url.searchParams;
    const name = params.get("name");

    return (<>
    <h1>pubnix/</h1>
    <h2>Success</h2>

    <p>Your account {name}/ has been created</p>

    <p>You should add an SSH key to your account:</p>

    <a href="/account">Account</a>
    </>);
}