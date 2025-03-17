import { showPoisonDialog } from "./ui.js";

// 🛠 Initialisierung des Moduls bei Foundry-Start
Hooks.once("init", () => {
    console.log("✅ Poison Applier Modul wird initialisiert...");

    // Registriere die API-Funktion für externe Nutzung
    game.modules.get("poison-applier").api = {
        showPoisonDialog
    };
});

// 🛠 Modul ist bereit (Debug-Log + Makro-Erstellung)
Hooks.once("ready", async () => {
    console.log("✅ Poison Applier Modul ist bereit!");

    // Stelle sicher, dass nur GMs das Makro erstellen können
    if (!game.user.isGM) {
        console.log("🔒 Nur GMs können das Makro erstellen.");
        return;
    }

    // Prüfen, ob das Makro bereits existiert
    let macro = game.macros.find(m => m.name === "poison-applicator");

    if (!macro) {
        console.log("🎭 Erstelle das Makro 'poison-applicator'...");

        try {
            // Erstelle das Makro und speichere es im Makro-Ordner
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
                scope: "global",
                folder: game.folders.find(f => f.name === "Makros" && f.type === "Macro")?.id || null
            });

            console.log("✅ Makro 'poison-applicator' wurde erfolgreich im Makro-Ordner gespeichert!");

        } catch (error) {
            console.error("❌ Fehler beim Erstellen des Makros:", error);
        }
    } else {
        console.log("ℹ️ Makro 'poison-applicator' existiert bereits.");
    }
});

