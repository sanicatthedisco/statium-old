"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Vector2_1 = require("../../shared/Utils/Vector2");
const ServerTroopRepresentation_1 = __importDefault(require("./ServerTroopRepresentation"));
const GameParameters_1 = require("../../shared/Utils/GameParameters");
class ServerCityRepresentation {
    constructor(id, position, simulator, ownerId) {
        this.troopCount = GameParameters_1.GameParameters.defaultTroopQuantity;
        this.troopSendNumber = 0;
        this.changeTroopCountBy = (delta) => { this.setTroopCount(this.troopCount + delta); };
        this.position = position;
        this.id = id;
        this.ownerId = ownerId;
        this.simulator = simulator;
    }
    update(deltaTime) {
        // Send troops out at intervals if they need to be sent
        // And only regenerate troops if we're not currently sending any
        if (this.troopCount < 0) {
            // We should change owners, but let's wait for the server to adjudicate that for us.
            // in the mean time, stop doing anything
        }
        else {
            if (this.troopSendNumber > 0) {
                this.sendTroopsIfPossible();
            }
            else {
                this.regenerateTroops();
            }
        }
    }
    sendTroopsIfPossible() {
        if (this.troopCount <= 1) {
            this.troopSendNumber = 0;
        }
        let now = Date.now();
        if (!this.lastSpawnTime)
            this.lastSpawnTime = now; // on first loop, init
        // Spawn troops at intervals
        if (this.troopCount > 1 && // If we have troops to send
            now - this.lastSpawnTime > GameParameters_1.GameParameters.troopSpawnInterval // And the interval has elapsed
            && this.ownerId && this.destination) { // Sanity check that we have an owner and a destination
            // Spawn the troop and update the relevant counters
            this.simulator.troops.push(new ServerTroopRepresentation_1.default(this.position, this.destination, this.ownerId));
            this.changeTroopCountBy(-1);
            this.lastSpawnTime = now;
        }
    }
    regenerateTroops() {
        let now = Date.now();
        if (!this.lastTroopIncreaseTime)
            this.lastTroopIncreaseTime = now;
        if (!this.lastTroopDamageTime)
            this.lastTroopDamageTime = now;
        if (now - this.lastTroopIncreaseTime > GameParameters_1.GameParameters.troopIncreaseInterval &&
            now - this.lastTroopDamageTime > GameParameters_1.GameParameters.damageRecoveryTime) {
            this.changeTroopCountBy(1);
            this.lastTroopIncreaseTime = now;
        }
    }
    interactWithTroop(troopOwnerId) {
        if (this.ownerId == troopOwnerId) {
            this.changeTroopCountBy(1);
        }
        else {
            this.lastTroopDamageTime = Date.now();
            this.ownerIdOfLastDamagingTroop = troopOwnerId;
            this.changeTroopCountBy(-1);
            // change owner
            if (this.troopCount <= 0) {
                this.ownerId = troopOwnerId;
                this.troopCount = 0;
                this.troopSendNumber = 0;
            }
        }
    }
    // Changing state
    setTroopCount(count) {
        if (count < (this.ownerId ? GameParameters_1.GameParameters.maxTroopCount : GameParameters_1.GameParameters.maxTroopCountUnowned)) {
            this.troopCount = count;
        }
        else {
            this.troopCount = this.ownerId ? GameParameters_1.GameParameters.maxTroopCount : GameParameters_1.GameParameters.maxTroopCountUnowned;
        }
    }
    // Data management and interchange
    static fromCityData(cd, sim) {
        let city = new ServerCityRepresentation(cd.id, new Vector2_1.Vector2(cd.x, cd.y), sim, cd.ownerId);
        city.troopCount = cd.troopCount;
        city.troopSendNumber = cd.troopSendNumber;
        // ...might need to add more of these
        return city;
    }
    toCityData() {
        var _a;
        return {
            id: this.id,
            x: this.position.x,
            y: this.position.y,
            ownerId: this.ownerId,
            troopCount: this.troopCount,
            troopSendNumber: this.troopSendNumber,
            destinationId: (_a = this.destination) === null || _a === void 0 ? void 0 : _a.id,
        };
    }
    ;
}
exports.default = ServerCityRepresentation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmVyQ2l0eVJlcHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NlcnZlci9HYW1lT2JqZWN0UmVwcmVzZW50YXRpb25zL1NlcnZlckNpdHlSZXByZXNlbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHdEQUFxRDtBQUNyRCw0RkFBb0U7QUFDcEUsc0VBQTZFO0FBSzdFLE1BQXFCLHdCQUF3QjtJQWdCekMsWUFBWSxFQUFVLEVBQUUsUUFBaUIsRUFBRSxTQUF3QixFQUFFLE9BQWdCO1FBWHJGLGVBQVUsR0FBVywrQkFBTSxDQUFDLG9CQUFvQixDQUFDO1FBQ2pELG9CQUFlLEdBQVcsQ0FBQyxDQUFDO1FBK0YvQix1QkFBa0IsR0FBRyxDQUFDLEtBQWEsRUFBRSxFQUFFLEdBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFBLENBQUEsQ0FBQyxDQUFDO1FBcEYvRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxNQUFNLENBQUMsU0FBaUI7UUFDcEIsdURBQXVEO1FBQzdELGdFQUFnRTtRQUVoRSxJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDekIsb0ZBQW9GO1lBQ3BGLHdDQUF3QztRQUN6QyxDQUFDO2FBQU0sQ0FBQztZQUNQLElBQUksSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDN0IsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFD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