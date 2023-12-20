import "$std/dotenv/load.ts";
import { NodeClient } from "hs-client";

const clientOptions = {
    host: Deno.env.get("HSD_HOST") ?? "127.0.0.1",
    port: parseInt(Deno.env.get("HSD_PORT") ?? "12037"),
    apiKey: Deno.env.get("HSD_API_KEY") ?? "x"
}

const client = new NodeClient(clientOptions);

type VerifyMessageResponse = {
    success: boolean;
    error?: Error;
}


export const verifyMessage = async (name: string, signature: string, message: string): Promise<VerifyMessageResponse> => {
    try {
        const success = await client.execute("verifymessagewithname", [name, signature, message]);
        return { success };
    } catch (error) {
        return { success: false, error };
    }
}