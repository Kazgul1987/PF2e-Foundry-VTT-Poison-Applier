# PF2e-Foundry-VTT-Poison-Applier

[Deutsch](README.de.md)

This module makes it easier to track the use of poisons in Foundry VTT. After application, it clearly shows which weapon has been treated with which poison.

## Installation

1. In Foundry VTT's Setup screen, open the "Add-on Modules" tab.
2. Click "Install Module".
3. Enter the following Manifest URL and confirm: https://raw.githubusercontent.com/Kazgul1987/PF2e-Foundry-VTT-Poison-Applier/main/module.json
4. Activate the module in your world from the "Manage Modules" dialog.

## Usage

After enabling the module, a macro **"Poison Applicator"** is automatically created at game start. Run this macro to open a dialog where you select a weapon and a suitable poison from the selected token's inventory.

After selection, an effect is added to the token. This effect links to the in-game poison and displays the weapon it was applied to. From the effect you can perform any rolls the poison requires (e.g. damage or saving throws). At the same time, the quantity of the poison in the inventory is reduced by one.

Compatible with Foundry VTT v13.

## Dependencies

- System: Pathfinder Second Edition (minimum 5.0.0, verified 6.1.0).
- For hit animations, install the [Automated Animations](https://foundryvtt.com/packages/autoanimations) module and a suitable jB2A asset pack.
