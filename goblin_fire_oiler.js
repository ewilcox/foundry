// Macro for placing the spire goblins gifted Alchemical Fire Oil to a weapon
// Will apply 1d6 bonus damage to your weapon and remove 1 dose of the item labeled "Alchemy Weapon Fire"
// IMPORTANT: Item name has to match the macro name to find the item to apply (and for macro to work)
// If already enabled will remove the weapon modifier on the weapon
// NOTE: This also only currently works for 1 weapon at a time
// Written by Eric Wilcox 09/02/2023

// This is currently the symbol for the macro
const goblinAlchemyFireIconPath = 'icons/consumables/potions/potion-flask-corked-orange.webp';
const goblinAlchemyFireItemName = 'Goblin Fire Oil';

main()

/**
 * Toggles the icon from global variable {goblinAlchemyFireIconPath} on the actor token.
 */
function toggleAlchemyFireIcon() {
    (async () => { 
        toggleActorIconResult = await token.toggleEffect(goblinAlchemyFireIconPath);
    })();
}

function broadcastMessage(message) {
    if (message !== null || message !== undefined || message !== '') {
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: message
        };
        ChatMessage.create(chatData, {});
    }
}

async function main() {
    if(canvas.tokens.controlled === 0 || canvas.tokens.controlled > 1) {
        ui.notifications.error(`No token is currently being controlled. Please select your character token.`);
        return;
    } else {
        let token = canvas.tokens.controlled[0];
        let actor = token.actor;
        let enabled = false;
        let weapon = null;
        let weaponId = null;
        let actorWeapons = null;
        // make sure the actor has the goblin fire oil (ITEM NAME NEEDS TO MATCH!)
        let fireOil = actor.items.filter(item => item.name === `${goblinAlchemyFireItemName}`)[0];
        
        if (fireOil === null || fireOil === undefined) {
            ui.notifications.error(`Sorry, no ${goblinAlchemyFireItemName} found in your inventory.`);
            return;
        }

        // get all the actors items of type weapon (not including bows)
        actorWeapons = actor.items.filter(item => item.type === "weapon" && !item.name.toString().toLowerCase().includes('bow'));

        let options = ""
        for(let weapon of actorWeapons) {
            options += `<option value=${weapon.id}>${weapon.name}  |  ${weapon.system.damage.parts[0]?.toString().substr(0,4).replace("[","")}`
        }

        // set flag state to enabled if already active on any weapon
        for(let weapon of actorWeapons) {
            if (weapon.flags.goblinAlchemyFire !== null && weapon.flags.goblinAlchemyFire !== undefined) {
                enabled = true;
                weaponId = weapon.id;
            }
        }

        if (enabled) {
            let weaponFlag = {};

            weapon = actor.items.find(item => item.id === weaponId);

            let oldDmg = weapon.flags.goblinAlchemyFire.oldDmg;
            weaponFlag['flags.goblinAlchemyFire'] = null;
            weaponFlag['system.damage'] = oldDmg;
            
            weapon.update(weaponFlag);

            toggleAlchemyFireIcon();
            broadcastMessage(`The ${goblinAlchemyFireItemName} effect has ended on ${actor.name}'s ${weapon.name}.`);
            ui.notifications.info(`The ${goblinAlchemyFireItemName} effect has ended on ${actor.name}'s ${weapon.name}.`);
        } else {
            let dialogTemplate = `
                <h2>Select a weapon</h2>
                <div style="display: flex;">
                    <span style="flex:1;"> Select a weapon: <select id="weapon" style="float:right;">${options}</select></span>
                    <br><br><br>
                </div>
            `
            new Dialog({
                title: `Weapon Oiler`,
                content: dialogTemplate,
                buttons: {
                    rollAttack: {
                        label: "Apply",
                        callback: (html) => {
                            weaponId = html.find("#weapon")[0].value;
                            weapon = actor.items.find(item => item.id === weaponId);
                            
                            let weaponFlag = {};
                            weaponFlag['flags.goblinAlchemyFire.enabled'] = true;
                            let oldDmgJson = weapon.system.damage;
                            let oldDmgNumber = weapon.system.damage.parts[0][0];
                            let oldDmgType = weapon.system.damage.parts[0][1];
                            weaponFlag['flags.goblinAlchemyFire.oldDmg'] = JSON.parse(JSON.stringify(oldDmgJson));

                            newDmg = {
                                "parts" : [
                                    [
                                        `${oldDmgNumber} + 1d6`,
                                        `${oldDmgType}`
                                    ]
                                ],
                                "versitile": ""
                            };

                            weaponFlag['system.damage'] = newDmg;

                            weapon.update(weaponFlag);

                            fireOil.update({'system.quantity': fireOil.system.quantity - 1});
                            if (fireOil.system.quantity < 1) {
                                fireOil.delete();
                            }

                            toggleAlchemyFireIcon();
                            broadcastMessage(`A dose of ${goblinAlchemyFireItemName} has been applied to ${actor.name}'s ${weapon.name}.`);
                            ui.notifications.info(`A dose of ${goblinAlchemyFireItemName} has been applied to ${actor.name}'s ${weapon.name}.`);
                        }
                    },
                    close: {
                        label: "Cancel",
                    }
                }
            }).render(true);   
        }
    }
}