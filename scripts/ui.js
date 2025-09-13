 import { applyPoisonEffect } from "./effects.js";

// 🛠 Funktion zum Filtern von Waffen im Inventar
function getWeapons(actor) {
    return actor.items.filter(item => item.type === "weapon");
}

// 🛠 Funktion zum Filtern von Giften im Inventar
function getPoisons(actor) {
    return actor.items.filter(item => item.type === "consumable" && item.system.traits.value.includes("poison"));
}

// 🛠 Hauptfunktion zum Anwenden des Gifts
async function applyPoison(actor, weaponId, poisonId) {
    let weapon = actor.items.get(weaponId);
    let poison = actor.items.get(poisonId);

    if (!weapon || !poison) {
        ui.notifications.error("Error applying poison.");
        return;
    }

    // Ensure only actual weapons can be poisoned
    if (weapon.type !== "weapon") {
        ui.notifications.error("You can only poison weapons!");
        return;
    }

    // Aufruf der separaten Funktion aus effects.js
    await applyPoisonEffect(actor, weapon, poison);
}

// 🛠 Dialog zur Auswahl der Waffe und des Gifts
async function showPoisonDialog(actor) {
    if (!actor) {
        ui.notifications.error("No valid actor selected.");
        return;
    }

    console.log(`📌 Selected actor: ${actor.name}`, actor);

    let weapons = getWeapons(actor);
    let poisons = getPoisons(actor);


    if (weapons.length === 0) {
        ui.notifications.warn("You have no weapons that can be poisoned.");
        return;
    }

    if (poisons.length === 0) {
        ui.notifications.warn("You have no poisons in your inventory.");
        return;
    }

    const templatePath = "modules/poison-applier/templates/apply-poison.html";
    const content = await renderTemplate(templatePath, { weapons, poisons });

    new Dialog({
        title: "Apply Poison to Weapon",
        content,
        buttons: {
            apply: {
                label: "Apply",
                callback: (html) => {
                    let weaponId = html.find("#weapon").val();
                    let poisonId = html.find("#poison").val();
                    applyPoison(actor, weaponId, poisonId);
                }
            },
            cancel: {
                label: "Cancel"
            }
        }
    }).render(true);
}

// 🛠 Exportiere die Hauptfunktion zur Nutzung in Foundry
export function registerPoisonApplier() {
    game.modules.get("poison-applier").api = {
        showPoisonDialog
    };
}

