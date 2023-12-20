export default function Challenge(props: { challenge: string}) {

    const copy = () => {
        navigator.clipboard.writeText(props.challenge);
    }
    return (<>
        <pre>{props.challenge}</pre>
        <button type="button" onClick={copy}>Copy</button>
    </>)
}