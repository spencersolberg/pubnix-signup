import BobSignup from "../islands/BobSignup.tsx"

export default function SignUp() {
    return (<>
        <h1>pubnix/</h1>
        <h2>Signup</h2>
        
        <form action="/api/signup" method="POST">
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

        <BobSignup signup={true} />

        <a href="/">Back to home</a>
    </>)
}