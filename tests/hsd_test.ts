import { verifyMessage } from "../utils/hsd.ts";
import { assert } from "$std/testing/asserts.ts";

Deno.test("verify message", async (t) => {
    await t.step("valid signature", async () => {
        const name = "boneworks";
        const signature = "P/HllevOu9ZJaEnAhGpaVC+s96Z3GhDmFjUhOjwBOaUegJGtvM7S1Yg/tklUk2hsU5BmyY4PufFyUWmr1ck0HA==";
        const message = "pubnix";
    
        const verified = await verifyMessage(name, signature, message);
    
        if (!verified.success) {
            console.error(verified.error);
        };
    
        assert(verified.success);
    });

    await t.step("bogus signature", async () => {
        const name = "boneworks";
        const signature = "bogus";
        const message = "pubnix";

        const verified = await verifyMessage(name, signature, message);

        assert(!verified.success);
    });
});