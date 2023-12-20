import { assertEquals } from "$std/testing/asserts.ts";
import { signToken, verifyToken } from "../utils/jwt.ts";

Deno.test("JWT", async () => {
    const name = "pubnix";

    const token = await signToken(name);
    const verification = await verifyToken(token);

    assertEquals(verification.name, name);
});