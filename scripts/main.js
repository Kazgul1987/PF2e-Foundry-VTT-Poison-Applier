Hooks.once("ready", async () => {
    console.log("🔹 Poison Applier Modul geladen!");

    // API registrieren
    game.modules.get("poison-applier").api = {
        showPoisonDialog: () => {
            console.log("🎭 Das Gift-Dialogfenster wird geöffnet...");
            game.poisonApplier.showPoisonDialog();
        }
    };

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
                game.modules.get("poison-applier").api.showPoisonDialog();
            `,
            img: "icons/skills/toxins/poison-bottle-green.webp"
        });
        console.log("✅ Makro erfolgreich erstellt:", macro);
    } else {
        console.log("✅ Makro existiert bereits.");
    }
});
