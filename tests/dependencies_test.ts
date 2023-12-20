import { runCommand } from "../utils/utils.ts";

Deno.test("check dependencies", async (t) => {
    if (Deno.build.os !== "linux") {
        console.warn("Not running on linux, skipping dependency check");
        return;
    }
    const dependencies = [
        "useradd",
        "passwd",
        "chmod",
        "chown",
        "systemctl",
        "userdel",
        "coredns",
        "ls",
        "openssl",
        "echo",
        "xxd",
        "bash",
        "dnssec-keygen",
        "dnssec-dsfromkey",
        "caddy"
    ];

    for (const dependency of dependencies) {
        await t.step(dependency, async () => {
            await runCommand(`which ${dependency}`);
        });
    }
});