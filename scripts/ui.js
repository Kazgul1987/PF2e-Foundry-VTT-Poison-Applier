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

import { applyPoisonEffect } from "./effects.js";

async function applyPoison(actor, weaponId, poisonId) {
    let weapon = actor.items.get(weaponId);
    let poison = actor.items.get(poisonId);

    if (!weapon || !poison) {
        ui.notifications.error("Fehler beim Anwenden des Gifts.");
        return;
    }

    // Die separate Funktion aus effects.js aufrufen
    await applyPoisonEffect(actor, weapon, poison);
}
