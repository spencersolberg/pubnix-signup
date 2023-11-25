export default function Home() {
  return (<>
    <h1>Pubnix</h1>
    <h2>Signup</h2>
    <form action="/api/signup" method="POST">
      <label htmlFor="name">Domain Name</label>
      <br />
      <input type="text" name="name"/>
      <br />
      <label htmlFor="key">SSH Public Key</label>
      <br />
      <textarea name="key" />
      <br />
      <label htmlFor="signature">Signature</label>
      <br />
      <textarea name="signature" />
      <br />
      <button type="submit">Submit</button>

    </form>
    </>);
}
