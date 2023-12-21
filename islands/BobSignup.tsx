import { useEffect, useState } from "preact/hooks";

declare global {
	interface Window {
		bob3: Bob3;
	}
}

interface Bob3 {
    connect(): Promise<Wallet>;
}

interface Wallet {
    getNames(): Promise<BobName[]>;
    signWithName(name: string, message: string): Promise<string>;
}

interface BobName {
    name: string;
}

export default function BobSignup(props: { signup: boolean }) {
    const [names, setNames] = useState<string[]>([]);

    const getNames = async (): Promise<string[]> => {
        const wallet = await window.bob3.connect();
        const names = (await wallet.getNames()).map(name => name.name);
        return names;
    }

    useEffect(() => {
        getNames().then(setNames);
    }, []);

    return (<>
    {names.length !== 0 && <>
        <h3>Names from Bob Wallet:</h3>
        <hr />
        <ul>
            {names.map(name => (<li>
                    <a href="#" onClick={() => {
                        const form = document.createElement("form");
                        form.setAttribute("method", "POST");
                        form.setAttribute("action", props.signup ? "/api/signup" : "/api/login");

                        const nameInput = document.createElement("input");
                        nameInput.setAttribute("type", "hidden");
                        nameInput.setAttribute("name", "name");
                        nameInput.setAttribute("value", name);

                        form.appendChild(nameInput);

                        document.body.appendChild(form);
                        form.submit();
                    }}>{name}/</a>
            </li>))}
            </ul>
            <hr />
    </>}
    </>)
}