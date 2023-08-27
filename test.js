// Test file for testing methods in Foundry VTT

main()

async function main() {

    let errorReason = '';

    if(canvas.tokens.controlled == 0 || canvas.tokens.controlled > 1) {
        errorReason = errorSelectCaster;
    }
    if(game.user.targets == 0 || game.user.targets > 1) {
        errorReason = errorSelectSingleTarget;
    }
    
    // console.log("Tokens: ", canvas.tokens)
    let token = canvas.tokens.controlled[0];
    let targets = Array.from(game.user.targets);

    if(targets.length == 0 || targets.length > 1) {
        errorReason = "Must target 1 and only 1";
    }

    console.log("Token: ", token);
    console.log("Target: ", targets);
    
    if (errorReason) {
        message.log("test");
        ui.notifications.error(`${errorReason}`);
        return;
    }

}