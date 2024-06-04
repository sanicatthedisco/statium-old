export const GameParameters = 
{
    // Overall apperance
    width: 640,
    height: 480,
    backgroundColor: "#eee",

    // Menus
    titleColor: 0x555555,

    // Networking params
    serverClientUpdateInterval: 50,
    simulationStepInterval: 10,
    
    // Troops
    troopSpeed: 0.3,
    troopRadius: 10,

    // Troop spawning
    troopSpawnInterval: 100,
    maxTroopCount: 99,
    maxTroopCountUnowned: 20,
    troopIncreaseInterval: 400,
    damageRecoveryTime: 500,

    // Cities
    cityRadius: 20,
    cityMargin: 20,
    numberOfCities: 10,
    defaultTroopQuantity: 10,

    // City appearance
    originHighlightColor: 0x0000aa,
    destinationHighlightColor: 0xaa0000,
	highlightThickness: 5,
    playerColors: [0x2ba9b4, 0xe39aac, 0x93d4b5, 0xf0dab1],
	defaultCityColor: 0x888888,
};