// Macro for placing Hunter's Mark on a target and link to the user
// Written by Eric Wilcox 08/25/23

// TODO consider allowing this set to '' to remove the mark from the players token, would need 2nd icon for target
// This is currently the symbol for the macro and the icon on the target and the player's token
const huntersMarkIconPath = 'icons/skills/targeting/crosshair-pointed-orange.webp';
const huntersMarkMacro = 'Hunters Mark';


main()

async function main() {
    if(canvas.tokens.controlled == 0 || canvas.tokens.controlled > 1) {
        ui.notifications.error(`No token is currently being controlled. Please select your character token.`);
        return;
    } else {
        let token = canvas.tokens.controlled[0];
        let actor = token.actor;
        let targets = Array.from(game.user.targets);
        // default starting states for the hunters mark and associated icon toggle
        let enabled = false;
        let toggleActorIconResult = false;
        let toggleTargetIconResult = false;
    
        if (targets.length == 0 || targets.length > 1) {
            ui.notifications.error(`Please target exactly 1 tolken.`);
        } else if (targets[0].actor.id == actor.id) {
            ui.notifications.error(`Are you really trying to cast Hunter's Mark on yourself ${actor.name}???`);
        } else {
            let selectedTokan = targets[0];
            let selectedActor = targets[0].actor;

            if (actor.flags.huntersMark !== null && actor.flags.huntersMark !== undefined) {
                enabled = true;
            }

            if (enabled) {
                chatMsg = `${actor.name} no longer has an active Hunter's Mark.`;

                let obj = {};
                obj['flags.huntersMark'] = null;
                obj['system.bonuses.mwak.damage'] = actor.flags.huntersMark.oldMDmg;
                obj['system.bonuses.rwak.damage'] = actor.flags.huntersMark.oldRDmg;

                actor.update(obj);
            } else {
                chatMsg = `${actor.name} has activated Hunter's Mark on ${selectedActor.name}`;

                let obj = {};
                obj['flags.huntersMark.enabled'] = true;
                // Preserve old mwak damage bonus if there was one
                let oldMDmg = actor.system.bonuses.mwak.damage;
                if (oldMDmg==null || oldMDmg == undefined || oldMDmg == '') oldMDmg = 0;
                obj['flags.huntersMark.oldMDmg'] = JSON.parse(JSON.stringify(oldMDmg));
                // Preserve old rwak damage bonus if there was one
                let oldRDmg = actor.system.bonuses.rwak.damage;
                if (oldRDmg==null || oldRDmg == undefined || oldRDmg == '') oldRDmg = 0;
                obj['flags.huntersMark.oldRDmg'] = JSON.parse(JSON.stringify(oldRDmg));
                //add the bonus hunters mark 1d6 damage to the previous bonus damage respecting old roll formula's if present
                if (oldMDmg==null || oldMDmg == undefined || oldMDmg == '' || oldMDmg == 0) {
                    obj['system.bonuses.mwak.damage'] = `1d6`;
                } else {
                    obj['system.bonuses.mwak.damage'] = `${oldMDmg} + 1d6`;
                }
                if (oldRDmg==null || oldRDmg == undefined || oldRDmg == '' || oldRDmg == 0) {
                    obj['system.bonuses.rwak.damage'] = `1d6`;
                } else {
                    obj['system.bonuses.rwak.damage'] = `${oldRDmg} + 1d6`;
                }	
        
                actor.update(obj);
            }

            //mark or unmark character token with Hunter's Mark effect icon
            (async () => { 
                toggleActorIconResult = await token.toggleEffect(huntersMarkIconPath);
                if (toggleActorIconResult == enabled) token.toggleEffect(huntersMarkIconPath);
            })();

            //mark or unmark selected targets token with Hunter's Mark effect icon
            (async () => { 
                toggleTargetIconResult = await selectedTokan.toggleEffect(huntersMarkIconPath);
                if (toggleTargetIconResult == enabled) selectedTokan.toggleEffect(huntersMarkIconPath);
            })();
            
            // UI notification of the Hunter's Mark activation / deactiviation
            ui.notifications.info(`${chatMsg}`);

            
        }
    }
}
