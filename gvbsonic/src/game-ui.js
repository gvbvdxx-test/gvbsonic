async function gameUICode() {
    tickEngine();
    window.sprites = [];
    await window.titleScreen();
	await window.doMenus();
}
