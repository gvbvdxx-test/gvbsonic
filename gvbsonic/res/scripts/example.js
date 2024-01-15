/*

Hello There!!!

This is your very first gvbsonic script, you can code anything you like
to run in gvbsonic, you have direct access to the games engine from here.

*/

gvbsonic.addEventListener("keydown", (key) => {
	if (key == "1") {
		gvbsonic.setPlayerCharacter(0);
	}
	if (key == "2") {
		gvbsonic.setPlayerCharacter(1);
	}
	if (key == "3") {
		gvbsonic.setPlayerCharacter(2);
	}
	if (key == "4") {
		gvbsonic.setPlayerCharacter(3);
	}
})