export default function Failure(req: Request) {
    const url = new URL(req.url);
    const error = url.searchParams.get("error");
    return (<>
    <h1>pubnix/</h1>
    <h2>Failure</h2>

    <p>Your account could not be created</p>
    {error && <pre>Error: {error}</pre>}
    <p>Please <a href="/">try again</a></p>
    </>)
}