export async function applyPoisonEffect(actor, weapon, poison) {
    // 🛠 Debugging: Zeige an, welche Waffe & Gift benutzt wurden
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

    // 🎯 Effekt am Token hinzufügen (sichtbarer Effekt mit ActiveEffect)
    const effectData = {
        name: `Vergiftete Waffe (${poison.name})`,
        icon: poison.img,
        origin: actor.uuid,
        duration: { rounds: 10 }, // Effekt hält 10 Runden
        changes: [],
        flags: {
            core: { statusId: "poisoned-weapon" }, // Status-ID für Token-HUD
            pf2e: { effectType: "temporary" }, // PF2e-spezifische Flags
            "token-attacher": { attachTo: "token" } // Effekt bleibt am Token
        }
    };

    try {
        await actor.createEmbeddedDocuments("ActiveEffect", [new ActiveEffect(effectData, { parent: actor }).toObject()]);
        console.log("🛠️ Status-Effekt erfolgreich auf Token angewendet:", effectData);
    } catch (error) {
        console.error("❌ Fehler beim Hinzufügen des Status-Effekts am Token:", error);
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
