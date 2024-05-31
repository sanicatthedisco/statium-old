"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameParameters = void 0;
exports.GameParameters = {
    // Overall apperance
    width: 640,
    height: 480,
    backgroundColor: "#eee",
    // Networking params
    serverClientUpdateInterval: 50,
    simulationStepInterval: 10,
    // Troops
    troopSpeed: 4,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVBhcmFtZXRlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2xpZW50L1V0aWxzL0dhbWVQYXJhbWV0ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFhLFFBQUEsY0FBYyxHQUMzQjtJQUNJLG9CQUFvQjtJQUNwQixLQUFLLEVBQUUsR0FBRztJQUNWLE1BQU0sRUFBRSxHQUFHO0lBQ1gsZUFBZSxFQUFFLE1BQU07SUFFdkIsb0JBQW9CO0lBQ3BCLDBCQUEwQixFQUFFLEVBQUU7SUFDOUIsc0JBQXNCLEVBQUUsRUFBRTtJQUUxQixTQUFTO0lBQ1QsVUFBVSxFQUFFLENBQUM7SUFDYixXQUFXLEVBQUUsRUFBRTtJQUVmLGlCQUFpQjtJQUNqQixrQkFBa0IsRUFBRSxHQUFHO0lBQ3ZCLGFBQWEsRUFBRSxFQUFFO0lBQ2pCLG9CQUFvQixFQUFFLEVBQUU7SUFDeEIscUJBQXFCLEVBQUUsR0FBRztJQUMxQixrQkFBa0IsRUFBRSxHQUFHO0lBRXZCLFNBQVM7SUFDVCxVQUFVLEVBQUUsRUFBRTtJQUNkLFVBQVUsRUFBRSxFQUFFO0lBQ2QsY0FBYyxFQUFFLEVBQUU7SUFDbEIsb0JBQW9CLEVBQUUsRUFBRTtJQUV4QixrQkFBa0I7SUFDbEIsb0JBQW9CLEVBQUUsUUFBUTtJQUM5Qix5QkFBeUIsRUFBRSxRQUFRO0lBQ3RDLGtCQUFrQixFQUFFLENBQUM7SUFDbEIsWUFBWSxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDO0lBQ3pELGdCQUFnQixFQUFFLFFBQVE7Q0FDMUIsQ0FBQyJ9