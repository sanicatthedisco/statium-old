import Color from "color";

export const GameParameters = 
{
    // Overall apperance
    width: 640,
    height: 480,
    backgroundColor: 0xeeeeee,

    // Menus
    titleColor: Color(0x555555),
    popupBackgroundColor: Color(0xdddddd),

    // Networking params
    serverClientUpdateInterval: 50,
    simulationStepInterval: 10,
    
    // Troops
    troopSpeed: 0.2,
    troopRadius: 10,

    // Troop spawning
    troopSpawnInterval: 150,
    maxTroopCount: 99,
    maxTroopCountUnowned: 20,
    troopIncreaseInterval: 400,
    damageRecoveryTime: 500,

    // Cities
    cityRadius: 15,
    cityMargin: 20,
    numberOfCities: 10,
    defaultTroopQuantity: 10,
    cityFontSize: 20,

    // City appearance
    originHighlightColor: Color(0x0000aa),
    destinationHighlightColor: Color(0xaa0000),
	highlightThickness: 5,
    playerColors: [Color(0x2ba9b4), Color(0xe39aac), Color(0x93d4b5), Color(0xf0dab1)],
	defaultCityColor: Color(0x888888),
    textUpdateInterval: 200,

    // Regions
    defaultRegionColor: Color(0xdddddd),
};