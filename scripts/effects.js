export async function applyPoisonEffect(actor, weapon, poison) {
    console.log(`✅ ${actor.name} trägt ${poison.name} auf ${weapon.name} auf.`);

    // 🎯 Effekt für die Waffe setzen (im Angriff)
    let attackEffects = weapon.system.attackEffects?.value || [];
    if (!attackEffects.includes("poison")) {
        attackEffects.push("poison");
    }

    try {
        await weapon.update({ "system.attackEffects.value": attackEffects });
        console.log("🛠️ Waffe aktualisiert mit Gift-Effekt:", attackEffects);
    } catch (error) {
        console.error("❌ Fehler beim Anwenden des Effekts auf die Waffe:", error);
    }

    // 🎯 Effekt als echtes PF2e-Item hinzufügen (sichtbar in der Effekt-Liste)
    const effectData = {
        name: `Vergiftete Waffe (${poison.name})`,
        type: "effect",
        img: poison.img,
        system: {
            description: { value: `<p>Diese Waffe wurde mit <strong>${poison.name}</strong> vergiftet.</p>` },
            duration: { value: 10, unit: "rounds" },
            tokenIcon: { show: true },
            rules: [],
            slug: `poisoned-weapon-${actor.id}`
        }
    };

    try {
        await actor.createEmbeddedDocuments("Item", [effectData]);
        console.log("🛠️ Effekt erfolgreich auf Token angewendet:", effectData);
    } catch (error) {
        console.error("❌ Fehler beim Hinzufügen des Effekts am Token:", error);
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

    // 💬 Nachricht im Chat posten
    ChatMessage.create({
        content: `<b>${actor.name}</b> hat <b>${poison.name}</b> auf <b>${weapon.name}</b> angewendet! Die Waffe ist jetzt vergiftet!`,
        speaker: ChatMessage.getSpeaker({ actor: actor })
    });

    ui.notifications.info(`${poison.name} wurde auf ${weapon.name} angewendet.`);
}
