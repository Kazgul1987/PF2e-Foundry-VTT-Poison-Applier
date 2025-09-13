# PF2e-Foundry-VTT-Poison-Applier

This module makes it easier to track the use of poisons in Foundry VTT. After application, it clearly shows which weapon has been treated with which poison.

## Usage

After enabling the module, a macro **"Poison Applicator"** is automatically created at game start. Run this macro to open a dialog where you select a weapon and a suitable poison from the selected token's inventory.

After selection, an effect is added to the token. This effect links to the in-game poison and displays the weapon it was applied to. From the effect you can perform any rolls the poison requires (e.g. damage or saving throws). At the same time, the quantity of the poison in the inventory is reduced by one.

Compatible with Foundry VTT v13.

### Animations

To play a jB2A animation on a hit, the [Automated Animations](https://foundryvtt.com/packages/autoanimations) module and a suitable jB2A asset pack must be installed and active.
