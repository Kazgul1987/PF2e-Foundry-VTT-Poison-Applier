export function showPoisonDialog(actor) {
    // Finde Waffen und Gifte im Inventar
    let weapons = actor.items.filter(item => item.type === "weapon");
    let poisons = actor.items.filter(item => item.type === "consumable" && item.system.subtype === "poison");

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

    // Optional: Füge einen visuellen Effekt für das Token hinzu
    await actor.createEmbeddedDocuments("ActiveEffect", [{
        label: `Vergiftete Waffe (${poison.name})`,
        icon: poison.img,
        duration: { seconds: 600 }, // 10 Minuten
        changes: [{ key: "system.bonuses.melee.damage", value: "+1", mode: 2 }]
    }]);

    // Optional: Entferne das Gift aus dem Inventar
    await poison.update({ "system.quantity": poison.system.quantity - 1 });

    // Chat-Nachricht anzeigen
    ChatMessage.create({
        content: `<b>${actor.name}</b> hat <b>${poison.name}</b> auf <b>${weapon.name}</b> angewendet!`,
        speaker: ChatMessage.getSpeaker({ actor: actor })
    });

    ui.notifications.info(`${poison.name} wurde auf ${weapon.name} angewendet.`);
}
