const MODULE_ID = "poison-applier";

export async function applyPoisonEffect(actor, weapon, poison) {
  console.log(`✅ ${actor.name} applies ${poison.name} to ${weapon.name}.`);

  // Mark the weapon as poisoned via a flag
  await weapon.setFlag(MODULE_ID, "poisoned", true);

  const slug = `poisoned-weapon-${actor.id}-${weapon.id}`.toLowerCase();
  const effectData = {
    name: `Poisoned ${weapon.name} (${poison.name})`,
    type: "effect",
    img: poison.img,
    flags: {
      core: { sourceId: poison.uuid }
    },
    system: {
      slug,
      tokenIcon: { show: true },
      duration: { value: 10, unit: "rounds" },
      rules: [],
      description: {
        value: `<p><strong>${weapon.name}</strong> has been poisoned with <strong>${poison.name}</strong>. @UUID[${poison.uuid}]{${poison.name}}</p>` +
               (poison.system?.description?.value || ""),
        gm: poison.system?.description?.gm || ""
      }
    }
  };

  try {
    await actor.createEmbeddedDocuments("Item", [effectData]);
  } catch (error) {
    console.error("❌ Error adding effect to token:", error);
  }

  const newQuantity = Math.max((poison.system.quantity ?? 1) - 1, 0);
  await poison.update({"system.quantity": newQuantity});

  ChatMessage.create({
    content: `<b>${actor.name}</b> applied <b>${poison.name}</b> to <b>${weapon.name}</b>!`,
    speaker: ChatMessage.getSpeaker({actor})
  });

  ui.notifications.info(`${poison.name} has been applied to ${weapon.name}.`);
}

export async function applyPoisonCoatEffect(actor, weapon, poison) {
  console.log(`✅ ${actor.name} prepares ${poison.name} with Poison Coat.`);

  const slug = `poison-coat-${actor.id}`.toLowerCase();
  const effectData = {
    name: `Poison Coat (${poison.name})`,
    type: "effect",
    img: poison.img,
    flags: {
      core: { sourceId: poison.uuid }
    },
    system: {
      slug,
      tokenIcon: { show: true },
      duration: { value: 10, unit: "rounds" },
      rules: [],
      description: {
        value: `<p><strong>${actor.name}</strong> prepares <strong>${poison.name}</strong> with Poison Coat.</p>` +
               (poison.system?.description?.value || ""),
        gm: poison.system?.description?.gm || ""
      }
    }
  };

  try {
    const existingCoat = actor.items.find(i => i.type === "effect" && i.slug === slug);
    if (existingCoat) {
      await actor.deleteEmbeddedDocuments("Item", [existingCoat.id]);
    }
    await actor.createEmbeddedDocuments("Item", [effectData]);
  } catch (error) {
    console.error("❌ Error adding Poison Coat effect:", error);
  }

  const newQuantity = Math.max((poison.system.quantity ?? 1) - 1, 0);
  await poison.update({"system.quantity": newQuantity});

  const weaponMessage = weapon ? ` for <b>${weapon.name}</b>` : "";
  ChatMessage.create({
    content: `<b>${actor.name}</b> prepares <b>${poison.name}</b>${weaponMessage} with <b>Poison Coat</b>!`,
    speaker: ChatMessage.getSpeaker({actor})
  });

  ui.notifications.info(`${poison.name} has been prepared with Poison Coat.`);
}

export async function postPoisonEffectOnHit(message) {
  const context = message.flags?.pf2e?.context;
  if (!context) return;
  const outcome = context.outcome;
  const isAttack = ["success", "criticalSuccess", "criticalFailure", "failure"].includes(outcome);
  if (!isAttack) return;

  const token = canvas.tokens.get(message.speaker.token);
  const actor = token?.actor ?? message.actor ?? game.actors.get(message.speaker.actor);
  if (!actor) {
    console.warn("Poison Applier | Actor not found for message", message);
    return;
  }

  const weaponUuid = message.item?.uuid
    ?? message.flags?.pf2e?.strike?.item?.uuid
    ?? message.flags?.pf2e?.origin?.uuid;
  if (!weaponUuid) {
    console.warn("Poison Applier | weaponUuid missing on message", message);
    return;
  }

  const weapon = await fromUuid(weaponUuid);
  if (!weapon || weapon.type !== "weapon") return;
  const poisoned = weapon.getFlag(MODULE_ID, "poisoned");
  if (game.settings.get(MODULE_ID, "debug")) {
    console.log(`Poison Applier | ${weapon.name} ${poisoned ? "has a poison." : "does not have a poison."}`);
    console.log(`Poison Applier | Outcome: ${outcome}`);
  }
  if (!poisoned) {
    console.warn(`Poison Applier | weapon ${weapon.name} lacks poison flag.`);
    return;
  }

  const slug = `poisoned-weapon-${actor.id}-${weapon.id}`.toLowerCase();
  const effect = actor.items.find(i => i.type === "effect" && i.slug === slug);
  if (!effect) return;
  if (["success", "criticalSuccess"].includes(outcome)) {
    await effect.toMessage({}, { create: true });
    const target = message?.targets?.[0];
    if (game.modules.get("autoanimations")?.active && game.modules.get("sequencer")?.active && target) {
      if (game.settings.get(MODULE_ID, "debug")) {
        console.log("Poison Applier | Playing poison effect animation via Sequencer.");
      }
      new Sequence()
        .effect()
          .file("autoanimations.static.liquid.splash.01.green")
          .atLocation(target)
        .play();
    }
  }
  await actor.deleteEmbeddedDocuments("Item", [effect.id]);
  await weapon.unsetFlag(MODULE_ID, "poisoned");
}
