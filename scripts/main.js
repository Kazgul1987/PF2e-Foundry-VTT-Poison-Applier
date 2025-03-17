console.log("Giftapplikator Modul geladen!");

// Füge eine Option zum Kontextmenü des Tokens hinzu
Hooks.on("getActorDirectoryEntryContext", (html, options) => {
    options.push({
        name: "Gift auf Waffe auftragen",
        icon: '<i class="fas fa-flask"></i>',
        callback: li => applyPoisonDialog(li)
    });
});

// Öffnet den Dialog zur Auswahl von Waffe & Gift
function applyPoisonDialog(li) {
    let actorId = li.data("documentId");
    let actor = game.actors.get(actorId);
    
    if (!actor) {
        ui.notifications.error("Kein gültiger Actor gefunden.");
        return;
    }

    // Importiere die UI-Funktion und öffne den Dialog
    import("./ui.js").then(module => module.showPoisonDialog(actor));
}
