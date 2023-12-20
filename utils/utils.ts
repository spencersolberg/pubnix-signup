export const isHandshake = (req: Request): boolean => {
    const url = new URL(req.url);
    const { hostname } = url;

    return hostname.endsWith("pubnix");
}

export const runCommand = async (command: string, env?: Record<string, string>): Promise<string> => {
    const program = command.split(" ")[0];
    const args = command.split(" ").slice(1);
    const cmd = new Deno.Command(program, { args, env });
    const { code, stdout, stderr } = await cmd.output();
    if (code !== 0) {
        throw new Error(new TextDecoder().decode(stderr));
    }
    return new TextDecoder().decode(stdout).trim();
}

export const isValidDomain = (domain: string): boolean => {
    // name can contain a-z, 0-9, and - or _ (but not at beginning or end)
    return domain.match(/^[a-z0-9]+[a-z0-9-_]*$/) !== null;
}