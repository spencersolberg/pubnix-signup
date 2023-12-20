export default function SignUp() {
    return (<>
        <h1>pubnix/</h1>
        <h2>Login</h2>
        
        <form action="/api/login" method="POST">
            <label htmlFor="name">Domain Name</label>
            <br />
            <br />
            <input type="text" name="name" />
            <br />
            <br />
            <button type="submit">Submit</button>
            <br />
            <br />
        </form>

        <a href="/">Back to home</a>
    </>)
}