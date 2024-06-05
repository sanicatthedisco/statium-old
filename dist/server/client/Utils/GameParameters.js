"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameParameters = void 0;
const color_1 = __importDefault(require("color"));
exports.GameParameters = {
    // Overall apperance
    width: 640,
    height: 480,
    backgroundColor: 0xeeeeee,
    // Menus
    titleColor: (0, color_1.default)(0x555555),
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
    originHighlightColor: (0, color_1.default)(0x0000aa),
    destinationHighlightColor: (0, color_1.default)(0xaa0000),
    highlightThickness: 5,
    playerColors: [(0, color_1.default)(0x2ba9b4), (0, color_1.default)(0xe39aac), (0, color_1.default)(0x93d4b5), (0, color_1.default)(0xf0dab1)],
    defaultCityColor: (0, color_1.default)(0x888888),
    textUpdateInterval: 100
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVBhcmFtZXRlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2xpZW50L1V0aWxzL0dhbWVQYXJhbWV0ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEwQjtBQUViLFFBQUEsY0FBYyxHQUMzQjtJQUNJLG9CQUFvQjtJQUNwQixLQUFLLEVBQUUsR0FBRztJQUNWLE1BQU0sRUFBRSxHQUFHO0lBQ1gsZUFBZSxFQUFFLFFBQVE7SUFFekIsUUFBUTtJQUNSLFVBQVUsRUFBRSxJQUFBLGVBQUssRUFBQyxRQUFRLENBQUM7SUFFM0Isb0JBQW9CO0lBQ3BCLDBCQUEwQixFQUFFLEVBQUU7SUFDOUIsc0JBQXNCLEVBQUUsRUFBRTtJQUUxQixTQUFTO0lBQ1QsVUFBVSxFQUFFLEdBQUc7SUFDZixXQUFXLEVBQUUsRUFBRTtJQUVmLGlCQUFpQjtJQUNqQixrQkFBa0IsRUFBRSxHQUFHO0lBQ3ZCLGFBQWEsRUFBRSxFQUFFO0lBQ2pCLG9CQUFvQixFQUFFLEVBQUU7SUFDeEIscUJBQXFCLEVBQUUsR0FBRztJQUMxQixrQkFBa0IsRUFBRSxHQUFHO0lBRXZCLFNBQVM7SUFDVCxVQUFVLEVBQUUsRUFBRTtJQUNkLFVBQVUsRUFBRSxFQUFFO0lBQ2QsY0FBYyxFQUFFLEVBQUU7SUFDbEIsb0JBQW9CLEVBQUUsRUFBRTtJQUV4QixrQkFBa0I7SUFDbEIsb0JBQW9CLEVBQUUsSUFBQSxlQUFLLEVBQUMsUUFBUSxDQUFDO0lBQ3JDLHlCQUF5QixFQUFFLElBQUEsZUFBSyxFQUFDLFFBQVEsQ0FBQztJQUM3QyxrQkFBa0IsRUFBRSxDQUFDO0lBQ2xCLFlBQVksRUFBRSxDQUFDLElBQUEsZUFBSyxFQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUEsZUFBSyxFQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUEsZUFBSyxFQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUEsZUFBSyxFQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JGLGdCQUFnQixFQUFFLElBQUEsZUFBSyxFQUFDLFFBQVEsQ0FBQztJQUM5QixrQkFBa0IsRUFBRSxHQUFHO0NBQzFCLENBQUMifQ==