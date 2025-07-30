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
//8dux3v-codex/makro-fur-poison-applicator-hinzufugen
    let effectData;

    if (game.modules.get('pf2e-extempore-effects')?.active && window.pf2eExtempore?.createEffect) {
        effectData = await window.pf2eExtempore.createEffect(poison);

        effectData.name = `Vergiftete Waffe (${poison.name})`;
        effectData.flags ??= {};
        effectData.flags.core ??= {};
        effectData.flags.core.sourceId = poison.uuid;

        effectData.system ??= {};
        effectData.system.description ??= {};
        effectData.system.description.value = `<p>Diese Waffe wurde mit <strong>${poison.name}</strong> vergiftet.</p>` +
            effectData.system.description.value;
        effectData.system.duration = { value: 10, unit: 'rounds' };
        effectData.system.tokenIcon = { show: true };
        effectData.system.slug = `poisoned-weapon-${actor.id}-${weapon.id}`;
    } else {
        effectData = {
            name: `Vergiftete Waffe (${poison.name})`,
            type: "effect",
            img: poison.img,
            flags: {
                core: {
                    sourceId: poison.uuid
                }
    const effectData = {
        name: `Vergiftete Waffe (${poison.name})`,
        type: "effect",
        img: poison.img,
        flags: {
            core: {
                sourceId: poison.uuid
            }
        },
        system: {
            description: {
                value: `<p>Diese Waffe wurde mit <strong>${poison.name}</strong> vergiftet.</p>` +
// xrqeqz-codex/makro-fur-poison-applicator-hinzufugen
                       `<p>Nutze @UUID[${poison.uuid}] für alle Würfe.</p>`
                       `<p>Nutze @UUID[${poison.uuid}]{${poison.name}} für alle Würfe.</p>`
// main
            },
            system: {
                description: {
                    value: `<p>Diese Waffe wurde mit <strong>${poison.name}</strong> vergiftet.</p>` +
                        `<p>Nutze @UUID[${poison.uuid}] für alle Würfe.</p>`
                },
                duration: { value: 10, unit: "rounds" },
                tokenIcon: { show: true },
                rules: [],
                slug: `poisoned-weapon-${actor.id}-${weapon.id}`
            }
        };
    }

    try {
        await actor.createEmbeddedDocuments("Item", [effectData]);
        console.log("🛠️ Effekt erfolgreich auf Token angewendet:", effectData);
    } catch (error) {
        console.error("❌ Fehler beim Hinzufügen des Effekts am Token:", error);
    }

    // 🎯 Die Menge des Gifts im Inventar verringern
    let newQuantity = (poison.system.quantity ?? 1) - 1;
    if (newQuantity < 0) newQuantity = 0;
    await poison.update({ "system.quantity": newQuantity });
    console.log(`🔢 ${poison.name} wurde reduziert auf ${newQuantity}.`);

    // 💬 Nachricht im Chat posten
    ChatMessage.create({
        content: `<b>${actor.name}</b> hat <b>${poison.name}</b> auf <b>${weapon.name}</b> angewendet! Die Waffe ist jetzt vergiftet!`,
        speaker: ChatMessage.getSpeaker({ actor: actor })
    });

    ui.notifications.info(`${poison.name} wurde auf ${weapon.name} angewendet.`);
}
