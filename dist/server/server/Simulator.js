"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSimulator = void 0;
const ServerCityRepresentation_1 = __importDefault(require("./GameObjectRepresentations/ServerCityRepresentation"));
// We simulate in a very similar way to the clients
// essentially running our own version of the game
// but without any rendering or player controls.
class GameSimulator {
    constructor(cityDataList) {
        this.troops = [];
        this.cities = [];
        this.updateTicker = 0; //debug
        this.simulationTime = Date.now();
        this.cities = cityDataList.map((cd) => (ServerCityRepresentation_1.default.fromCityData(cd, this)));
    }
    stepForward(deltaTime) {
        // May be a problem that this might happen in a diff order from clients
        // but prob not
        this.troops.forEach((troop, i, arr) => {
            troop.update(deltaTime);
            if (troop.destroyMe) {
                arr.splice(i, 1);
            }
        });
        this.cities.forEach((city) => {
            city.update(deltaTime);
        });
        this.simulationTime += deltaTime;
    }
    stepForwardTo(targetSimulationTime) {
        if (targetSimulationTime - this.simulationTime <= 0)
            console.warn("Target simulation time is before or during most recent simulation time!");
        else
            this.stepForward(targetSimulationTime - this.simulationTime);
    }
    getGameState() {
        let cityDataList = this.cities.map((city) => (city.toCityData()));
        return {
            cityDataList: cityDataList,
            creationTime: Date.now(),
        };
    }
}
exports.GameSimulator = GameSimulator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2ltdWxhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9TaW11bGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0Esb0hBQTRGO0FBRzVGLG1EQUFtRDtBQUNuRCxrREFBa0Q7QUFDbEQsZ0RBQWdEO0FBRWhELE1BQWEsYUFBYTtJQVF0QixZQUFZLFlBQXdCO1FBUHBDLFdBQU0sR0FBZ0MsRUFBRSxDQUFDO1FBQ3pDLFdBQU0sR0FBK0IsRUFBRSxDQUFDO1FBSXhDLGlCQUFZLEdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBTztRQUc3QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUVqQyxJQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQ25DLGtDQUF3QixDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQ2xELENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxXQUFXLENBQUMsU0FBaUI7UUFDekIsdUVBQXVFO1FBQ3ZFLGVBQWU7UUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDbEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDbEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckIsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDLGNBQWMsSUFBSSxTQUFTLENBQUM7SUFDckMsQ0FBQztJQUNELGFBQWEsQ0FBQyxvQkFBNEI7UUFDdEMsSUFBSSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUM7WUFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDOztZQUV4RixJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQsWUFBWTtRQUNSLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUN6QyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQ3BCLENBQUMsQ0FBQztRQUNILE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixZQUFZLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRTtTQUMzQixDQUFDO0lBQ04sQ0FBQztDQUVKO0FBL0NELHNDQStDQyJ9