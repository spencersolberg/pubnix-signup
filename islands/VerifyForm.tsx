export default function VerifyForm(props: { name: string, challenge: string, action: string, isHandshakeRequest: boolean }) {
    const signWithBobWallet = async () => {
        const wallet = await window.bob3.connect();
        const signature = await wallet.signWithName(props.name, props.challenge);

        // make POST navigation to /api/verify
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", props.action);

        const nameInput = document.createElement("input");
        nameInput.setAttribute("type", "hidden");
        nameInput.setAttribute("name", "name");
        nameInput.setAttribute("value", props.name);

        const signatureInput = document.createElement("input");
        signatureInput.setAttribute("type", "hidden");
        signatureInput.setAttribute("name", "signature");
        signatureInput.setAttribute("value", signature);

        form.appendChild(nameInput);
        form.appendChild(signatureInput);

        document.body.appendChild(form);
        form.submit();
    }
    return (<>
        <form action={props.action} method="POST">
            <br />
            <input type="hidden" name="name" value={props.name} />
            <label htmlFor="signature">Signature</label>
            <br />
            <textarea name="signature" />
            <br />
            <br />
            <button type="submit">Submit</button>
        </form>

        <p><strong>OR</strong></p>

        <button type="button" onClick={signWithBobWallet}>Sign with Bob Wallet</button>
        <br />
        <br />
        <a href={props.isHandshakeRequest ? `https://shakestation/manage/${props.name}#signMessage:${encodeURIComponent(btoa(props.challenge))}` : `https://shakestation.io/manage/${props.name}#signMessage:${btoa(props.challenge)}`} target="_blank" rel="noreferrer"><button type="button">Sign with ShakeStation</button></a>
    </>)
}