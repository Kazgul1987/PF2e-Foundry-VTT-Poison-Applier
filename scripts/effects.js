export async function applyPoisonEffect(actor, weapon, poison) {
  console.log(`✅ ${actor.name} trägt ${poison.name} auf ${weapon.name} auf.`);

  // Add poison trait to the weapon's attack effects
  const attackEffects = Array.from(weapon.system.attackEffects?.value || []);
  if (!attackEffects.includes("poison")) {
    attackEffects.push("poison");
    await weapon.update({"system.attackEffects.value": attackEffects});
  }

  const effectData = {
    name: `Vergiftete Waffe (${poison.name})`,
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
        value: `<p>Diese Waffe wurde mit <strong>${poison.name}</strong> vergiftet. @UUID[${poison.uuid}]{${poison.name}}</p>` +
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
