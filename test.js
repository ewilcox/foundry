// Test file for testing methods in Foundry VTT

// REMEMBER: to enable hooks to see debug output of actions being called
// use `CONFIG.debug.hooks = true` in the console

main()

async function main() {

    let errorReason = '';

    if(canvas.tokens.controlled == 0 || canvas.tokens.controlled > 1) {
        errorReason = errorSelectCaster;
    }

    const goblinAlchemyFireItemName = 'Goblin Fire Oil';
    let actor = canvas.tokens.controlled[0].actor;
    let fireOil = actor.items.filter(item => item.name === `${goblinAlchemyFireItemName}`)[0];

    await fireOil.update({'system.quantity': fireOil.system.quantity - 1});
    if (fireOil.system.quantity < 1) {
        fireOil.delete();
    }


    
    if (errorReason) {
        ui.notifications.error(`${errorReason}`);
        console.log(errorReason);
        return;
    }

}