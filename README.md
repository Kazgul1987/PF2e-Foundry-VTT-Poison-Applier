# PF2e-Foundry-VTT-Poison-Applier

Dieses Modul erleichtert es, den Einsatz von Giften in Foundry VTT zu verfolgen. Nach dem Auftragen wird deutlich angezeigt, welche Waffe mit welchem Gift behandelt wurde.

## Nutzung

Nach dem Aktivieren des Moduls wird beim Spielstart automatisch ein Makro **"Poison Applicator"** erstellt. Führe dieses Makro aus, um einen Dialog zu öffnen. Dort wählst du eine Waffe und ein passendes Gift aus dem Inventar des gewählten Tokens.

Nach der Auswahl wird auf dem Token ein Effekt angelegt. Dieser Effekt verlinkt auf das im Spiel hinterlegte Gift und zeigt an, auf welche Waffe es aufgetragen wurde. Aus dem Effekt heraus lassen sich alle Würfe des Giftes (z.B. Schadens- oder Rettungswürfe) verwenden. Gleichzeitig wird die Menge des verwendeten Giftes im Inventar um eins reduziert.

Kompatibel mit Foundry VTT v13.

### Animationen

Damit beim Treffer eine jB2A-Animation abgespielt wird, müssen das Modul [Automated Animations](https://foundryvtt.com/packages/autoanimations) sowie ein passendes jB2A-Asset-Paket installiert und aktiv sein.
