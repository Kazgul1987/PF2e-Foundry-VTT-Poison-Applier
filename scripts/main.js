import { registerPoisonApplier } from "./ui.js";
import { postPoisonEffectOnHit } from "./effects.js";

Hooks.once("ready", async () => {
    console.log("🔹 Poison Applier Modul geladen!");

    // Registriere die API für das Modul
    registerPoisonApplier();

    // Makro erstellen (Falls nicht vorhanden)
    let macro = game.macros.find(m => m.name === "Poison Applicator");
    if (!macro) {
        console.log("🛠️ Erstelle neues Makro für Poison Applicator...");
        macro = await Macro.create({
            name: "Poison Applicator",
            type: "script",
            scope: "global",
            command: `
                if (!canvas.tokens.controlled.length) {
                    ui.notifications.warn("Bitte ein Token auswählen!");
                    return;
                }
                let selectedActor = canvas.tokens.controlled[0]?.actor;
                if (!selectedActor) {
                    ui.notifications.error("Kein gültiger Actor gefunden!");
                    return;
                }
                game.modules.get("poison-applier").api.showPoisonDialog(selectedActor);
            `,
            img: "icons/skills/toxins/poison-bottle-green.webp"
        });
        console.log("✅ Makro erfolgreich erstellt:", macro);
    } else {
        console.log("✅ Makro existiert bereits.");
    }

    Hooks.on("createChatMessage", postPoisonEffectOnHit);
});
