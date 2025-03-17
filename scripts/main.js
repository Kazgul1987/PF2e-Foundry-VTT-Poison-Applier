import { showPoisonDialog } from "./ui.js";

// 🛠 Initialisierung des Moduls bei Foundry-Start
Hooks.once("init", () => {
    console.log("✅ Poison Applier Modul wird initialisiert...");

    // Registriere die API-Funktion für externe Nutzung
    game.modules.get("poison-applier").api = {
        showPoisonDialog
    };
});

// 🛠 Modul ist bereit (Debug-Log)
Hooks.once("ready", async () => {
    console.log("✅ Poison Applier Modul ist bereit!");

    // Prüfen, ob das Makro bereits existiert
    let macro = game.macros.find(m => m.name === "poison-applicator");
    
    if (!macro) {
        console.log("🎭 Erstelle das Makro 'poison-applicator'...");

        // Makro-Daten
        macro = await Macro.create({
            name: "poison-applicator",
            type: "script",
            img: "icons/skills/toxins/poison-bottle-green.webp", // Beliebiges Icon
            command: `
                let token = canvas.tokens.controlled[0]; 
                if (!token) {
                    ui.notifications.warn("Bitte wähle zuerst ein Token aus.");
                    return;
                }
                let actor = token.actor;
                if (!actor) {
                    ui.notifications.warn("Kein gültiger Actor für dieses Token gefunden.");
                    return;
                }
                game.modules.get("poison-applier").api.showPoisonDialog(actor);
            `,
            scope: "global"
        });

        console.log("✅ Makro 'poison-applicator' erstellt!");

        // Makro in die Hotbar legen (falls Platz vorhanden)
        let slot = game.user.hotbar.find(s => !s);
        if (slot) {
            await game.user.assignHotbarMacro(macro, slot);
            console.log(`📌 Makro 'poison-applicator' wurde auf Hotbar-Slot ${slot} gelegt.`);
        }
    }
});
