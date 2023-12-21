import { DomainConnection, DNSRecord } from "../utils/domain.ts";

export default function DomainConnection(props: { connection: DomainConnection }) {
    return (<>
        <h3>Connection Details</h3>
        <p>Connect your domain, {props.connection.domain}/ by setting either wallet records or DNS records</p>
        <h4>Wallet Records (Bob Wallet, ShakeStation, Namebase):</h4>
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                {props.connection.records.filter(record => record.kind === "wallet").map(record => (<tr>
                    <td>{record.type}</td>
                    <td>{record.value}</td>
                </tr>))}
            </tbody>
        </table>
        <p><strong>OR</strong></p>
        <h4>DNS Records (Varo, Namebase):</h4>
        <table>
            <thead>
                <tr>
                    <th>Domain</th>
                    <th>Type</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                {(props.connection.records.filter(record => record.kind === "dns") as DNSRecord[]).map(record => (<tr>
                    <td>{record.domain}</td>
                    <td>{record.type}</td>
                    <td>{record.value}</td>
                </tr>))}
            </tbody>
        </table>
        <form action="/api/domains/remove" method="POST">
            <input type="hidden" name="domain" value={props.connection.domain} />
            <button type="submit">Disconnect Domain</button>
        </form>
    </>)
}