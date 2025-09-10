export async function applyPoisonEffect(actor, weapon, poison) {
  console.log(`✅ ${actor.name} trägt ${poison.name} auf ${weapon.name} auf.`);

  // Add poison trait to the weapon's attack effects
  const attackEffects = Array.from(weapon.system.attackEffects?.value || []);
  if (!attackEffects.includes("poison")) {
    attackEffects.push("poison");
    await weapon.update({"system.attackEffects.value": attackEffects});
  }

  const effectData = {
    name: `Vergiftete ${weapon.name} (${poison.name})`,
    type: "effect",
    img: poison.img,
    flags: {
      core: { sourceId: poison.uuid }
    },
    system: {
      slug: `poisoned-weapon-${actor.id}-${weapon.id}`,
      tokenIcon: { show: true },
      duration: { value: 10, unit: "rounds" },
      rules: [],
      description: {
        value: `<p><strong>${weapon.name}</strong> wurde mit <strong>${poison.name}</strong> vergiftet. @UUID[${poison.uuid}]{${poison.name}}</p>` +
               (poison.system?.description?.value || ""),
        gm: poison.system?.description?.gm || ""
      }
    }
  };

  try {
    await actor.createEmbeddedDocuments("Item", [effectData]);
  } catch (error) {
    console.error("❌ Fehler beim Hinzufügen des Effekts am Token:", error);
  }

  const newQuantity = Math.max((poison.system.quantity ?? 1) - 1, 0);
  await poison.update({"system.quantity": newQuantity});

  ChatMessage.create({
    content: `<b>${actor.name}</b> hat <b>${poison.name}</b> auf <b>${weapon.name}</b> angewendet!`,
    speaker: ChatMessage.getSpeaker({actor})
  });

  ui.notifications.info(`${poison.name} wurde auf ${weapon.name} angewendet.`);
}

export async function postPoisonEffectOnHit(message) {
  const context = message.flags?.pf2e?.context;
  if (!context) return;
  const outcome = context.outcome;
  if (!["success", "criticalSuccess", "criticalFailure"].includes(outcome)) return;

  const actor = message.actor ?? game.actors.get(message.speaker.actor);
  if (!actor) return;

  const weaponUuid = message.flags?.pf2e?.weaponUuid
    ?? message.flags?.pf2e?.strike?.item?.uuid
    ?? message.flags?.pf2e?.origin?.uuid;
  if (!weaponUuid) return;

  const weapon = await fromUuid(weaponUuid);
  if (!weapon || weapon.type !== "weapon") return;
  const effects = Array.from(weapon.system.attackEffects?.value || []);
  if (!effects.includes("poison")) return;

  const slug = `poisoned-weapon-${actor.id}-${weapon.id}`;
  const effect = actor.items.find(i => i.type === "effect" && i.system?.slug === slug);
  if (!effect) return;

  if (["success", "criticalSuccess"].includes(outcome)) {
    await effect.toMessage({}, { create: true });
  }
  await actor.deleteEmbeddedDocuments("Item", [effect.id]);
  const updatedEffects = effects.filter(e => e !== "poison");
  await weapon.update({"system.attackEffects.value": updatedEffects});
}
