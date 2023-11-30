import { useState } from "preact/hooks";

declare global {
	interface Window {
		bob3: Bob3;
	}
}

interface Bob3 {
  connect(): Promise<Wallet>;
}

interface Wallet {
  signWithName(name: string, key: string): Promise<string>;
}

export default function SignupForm() {


  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [signature, setSignature] = useState("");

  const sign = async () => {
    const wallet = await window.bob3.connect();
    const signature = await wallet.signWithName(name, key);
    // setSignature(signature);
    // set the signature input value
    const signatureInput = document.querySelector("input[name=signature]");
    signatureInput?.setAttribute("value", signature);

    // submit form
    const form = document.querySelector("form");
    form?.submit();
  }
  return (
    <>
    <style>
      {`
      #no-key-link {
        font-size: 0.8em;
      }
      `}
    </style>
      <form action="/api/signup" method="POST">
        <label htmlFor="name">Domain Name</label>
        <br />
        <input type="text" name="name" value={name} onChange={e => setName((e.target as HTMLInputElement).value)}/>
        <br />
        <label htmlFor="key">SSH Public Key</label>
        <br />
        <a href="https://tilde.club/wiki/ssh.html#how-to-make-an-ssh-key" target="_blank"  rel="noreferrer" id="no-key-link">Don't have a key?</a>
        <br />
        <textarea name="key" value={key} onChange={e => setKey((e.target as HTMLInputElement).value)} />
        <br />
        <input type="hidden" name="signature" value={signature} />
        <button type="button" onClick={sign}>Sign</button>
        {/* <button type="submit">Submit</button> */}
      </form>
    </>
  );
}
