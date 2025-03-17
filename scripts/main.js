import { registerPoisonApplier, showPoisonDialog } from "./ui.js";

// 🛠 Initialisierung des Moduls bei Foundry-Start
Hooks.once("init", () => {
    console.log("✅ Poison Applier Modul wird initialisiert...");

    // Registriere die API-Funktion für externe Nutzung
    game.modules.get("poison-applier").api = {
        showPoisonDialog
    };
});

// 🛠 Debugging: Zeigt an, wenn das Modul bereit ist
Hooks.once("ready", () => {
    console.log("✅ Poison Applier Modul ist bereit!");
});

// 🛠 Optional: Ein Befehl für die Konsole, um das Dialogfenster zu öffnen
Hooks.on("renderActorSheet", (app, html, data) => {
    if (game.user.isGM) {
        console.log("🛠 Poison Applier API ist verfügbar unter:");
        console.log("game.modules.get('poison-applier').api.showPoisonDialog(actor)");
    }
});
