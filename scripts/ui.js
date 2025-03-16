   export function showPoisonDialog(actor) {
    // Debugging: Zeige alle Items im Inventar in der Konsole
    console.log("📦 Inventar von", actor.name, actor.items.map(i => `${i.type}: ${i.name}`));

    // Waffen suchen (PF2e speichert Waffen unterschiedlich)
    let weapons = actor.items.filter(item =>
        item.type === "weapon" || item.type === "melee" || item.type === "equipment"
    );

    // Gifte suchen (Veränderung für neue PF2e Versionen)
    let poisons = actor.items.filter(item =>
        item.type === "consumable" &&
        (item.system?.consumableType?.value === "poison" || item.system?.traits?.value?.includes("poison"))
    );

    // Debugging: Ausgabe in der Konsole für Foundry (F12 > Konsole)
    console.log("⚔️ Gefundene Waffen:", weapons);
    console.log("🧪 Gefundene Gifte:", poisons);

    if (weapons.length === 0 || poisons.length === 0) {
        ui.notifications.warn("Dieses Token hat keine Waffen oder keine Gifte.");
        return;
    }

    let content = `
        <form>
            <div class="form-group">
                <label>Waffe auswählen:</label>
                <select id="weapon-select">
                    ${weapons.map(weapon => `<option value="${weapon.id}">${weapon.name}</option>`).join("")}
                </select>
            </div>
            <div class="form-group">
                <label>Gift auswählen:</label>
                <select id="poison-select">
                    ${poisons.map(poison => `<option value="${poison.id}">${poison.name}</option>`).join("")}
                </select>
            </div>
        </form>
    `;

    new Dialog({
        title: "Gift auf Waffe auftragen",
        content,
        buttons: {
            apply: {
                label: "Anwenden",
                callback: html => {
                    let weaponId = html.find("#weapon-select").val();
                    let poisonId = html.find("#poison-select").val();
                    applyPoison(actor, weaponId, poisonId);
                }
            },
            cancel: {
                label: "Abbrechen"
            }
        }
    }).render(true);
}

// Funktion, die das Gift "aufträgt"
async function applyPoison(actor, weaponId, poisonId) {
    let weapon = actor.items.get(weaponId);
    let poison = actor.items.get(poisonId);

    if (!weapon || !poison) {
        ui.notifications.error("Fehler beim Anwenden des Gifts.");
        return;
    }

    // 🧪 Debugging: Zeige an, welche Waffe & Gift benutzt wurden
    console.log(`✅ ${actor.name} trägt ${poison.name} auf ${weapon.name} auf.`);

    // 🎯 Effekt auf das Token setzen (richtige Methode für PF2e)
    let effectData = {
        name: `Vergiftete Waffe (${poison.name})`,
        icon: poison.img,
        origin: actor.uuid,
        duration: { rounds: 10 }, // 10 Runden aktiv
        changes: [
            {
                key: "system.traits.value",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "poison",
                priority: 20
            }
        ]
    };

    try {
        // Füge den Effekt zum Actor hinzu
        await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
        console.log("🛠️ Effekt erfolgreich hinzugefügt:", effectData);
    } catch (error) {
        console.error("❌ Fehler beim Anwenden des Effekts:", error);
    }

    // 🎯 Das Gift aus dem Inventar entfernen oder reduzieren
    let newQuantity = (poison.system.quantity ?? 1) - 1;
    if (newQuantity <= 0) {
        await poison.delete();
        console.log(`🗑️ ${poison.name} wurde aus dem Inventar entfernt.`);
    } else {
        await poison.update({ "system.quantity": newQuantity });
        console.log(`🔢 ${poison.name} wurde reduziert auf ${newQuantity}.`);
    }

    // 💬 Nachricht in den Chat posten
    ChatMessage.create({
        content: `<b>${actor.name}</b> hat <b>${poison.name}</b> auf <b>${weapon.name}</b> angewendet! Die Waffe ist jetzt vergiftet!`,
        speaker: ChatMessage.getSpeaker({ actor: actor })
    });

    ui.notifications.info(`${poison.name} wurde auf ${weapon.name} angewendet.`);
}
