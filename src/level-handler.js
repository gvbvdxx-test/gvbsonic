window.runLevelsInOrder = async function runLevelsInOrder(domus) {
    ////////////////////////////////////////////////////////////

    //You can put intro cutsenes here before the levels start,
    //make sure to use "window.sprites = [];"!

    //Also you can have a fade transition by using "window.transitionFadeIn();" and "window.transitionFadeOut();".
    //You can also use that as an async function.

    ///////////////////////////////////////////////////////////

    //The handler value is basicly telling us what happens after an level has been beaten.

    //The value will ALWAYS be a string.

    //The value will be:

    //clear - Means that the level has been exited using a sign post, or another level exiting object, use this to move to the next level.

    //exit - Means that the player pressed exit to main menu, or escape to exit to the main menu.

    ////////////////////////////////////////////////////////////

    var handlerValue = null;

    for (var l of window.files.levelorder) {
        handlerValue = await dolevel(l, window.gvbsonicUseTailsNPC);
        if (handlerValue == "exit") {
            domus();
            return;
        }
    }

    ////////////////////////////////////////////////////////////


    //You can put cutsenes here when the game is finished.


    ////////////////////////////////////////////////////////////


    //This goes back the menu when the game is finished.

    domus();

    ////////////////////////////////////////////////////////////
}