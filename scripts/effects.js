const MODULE_ID = "poison-applier";

export async function applyPoisonEffect(actor, weapon, poison) {
  console.log(`✅ ${actor.name} trägt ${poison.name} auf ${weapon.name} auf.`);

  // Mark the weapon as poisoned via a flag
  await weapon.setFlag(MODULE_ID, "poisoned", true);

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

  const token = canvas.tokens.get(message.speaker.token);
  const actor = token?.actor ?? message.actor ?? game.actors.get(message.speaker.actor);
  if (!actor) {
    console.warn("Poison Applier | Actor not found for message", message);
    return;
  }

  const weaponUuid = message.flags?.pf2e?.weaponUuid
    ?? message.flags?.pf2e?.strike?.item?.uuid
    ?? message.flags?.pf2e?.origin?.uuid;
  if (!weaponUuid) {
    console.warn("Poison Applier | weaponUuid missing on message", message);
    return;
  }

  const weapon = await fromUuid(weaponUuid);
  if (!weapon || weapon.type !== "weapon") return;
  const poisoned = weapon.getFlag(MODULE_ID, "poisoned");
  if (!poisoned) {
    console.warn(`Poison Applier | weapon ${weapon.name} lacks poison flag.`);
    return;
  }

  const slug = `poisoned-weapon-${actor.id}-${weapon.id}`;
  const effect = actor.items.find(i => i.type === "effect" && i.system?.slug === slug);
  if (!effect) return;

  if (["success", "criticalSuccess"].includes(outcome)) {
    await effect.toMessage({}, { create: true });
    const aa = game.modules.get("autoanimations")?.API;
    if (aa) {
      aa.playAnimation(token, {
        animation: "jb2a.poison.spray.green",
        source: token,
        target: message?.targets?.[0]
      });
    }
  }
  await actor.deleteEmbeddedDocuments("Item", [effect.id]);
  await weapon.unsetFlag(MODULE_ID, "poisoned");
}
