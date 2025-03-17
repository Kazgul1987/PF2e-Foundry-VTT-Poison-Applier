import { registerPoisonApplier } from "./ui.js";

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
                game.modules.get("poison-applier").api.showPoisonDialog(canvas.tokens.controlled[0].actor);
            `,
            img: "icons/skills/toxins/poison-bottle-green.webp"
        });
        console.log("✅ Makro erfolgreich erstellt:", macro);
    } else {
        console.log("✅ Makro existiert bereits.");
    }
});
