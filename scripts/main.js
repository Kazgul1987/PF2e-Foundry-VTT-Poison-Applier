import { registerPoisonApplier } from "./ui.js";
import { postPoisonEffectOnHit } from "./effects.js";

const MODULE_ID = "poison-applier";

Hooks.once("init", () => {
    game.settings.register(MODULE_ID, "debug", {
        name: "Debug output",
        hint: "Enable additional debug output in the console.",
        scope: "client",
        config: true,
        type: Boolean,
        default: false
    });
});

Hooks.once("ready", async () => {
    console.log("🔹 Poison Applier module loaded!");

    // Register the API for the module
    registerPoisonApplier();

    // Create macro (if not already present)
    let macro = game.macros.find(m => m.name === "Poison Applicator");
    if (!macro) {
        console.log("🛠️ Creating new macro for Poison Applicator...");
        macro = await Macro.create({
            name: "Poison Applicator",
            type: "script",
            scope: "global",
            command: `
                if (!canvas.tokens.controlled.length) {
                    ui.notifications.warn("Please select a token!");
                    return;
                }
                let selectedActor = canvas.tokens.controlled[0]?.actor;
                if (!selectedActor) {
                    ui.notifications.error("No valid actor found!");
                    return;
                }
                game.modules.get("poison-applier").api.showPoisonDialog(selectedActor);
            `,
            img: "icons/skills/toxins/poison-bottle-green.webp"
        });
        console.log("✅ Macro successfully created:", macro);
    } else {
        console.log("✅ Macro already exists.");
    }

    Hooks.on("createChatMessage", postPoisonEffectOnHit);
});
