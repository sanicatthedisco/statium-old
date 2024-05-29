"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vector2_1 = require("../../client/Utils/Vector2");
const GameParameters_1 = require("../../client/Utils/GameParameters");
class ServerTroopRepresentation {
    constructor(position, destination, ownerId) {
        this.destroyMe = false;
        this.debugTicker = 0;
        this.ownerId = ownerId;
        this.position = position;
        this.destination = destination;
        ServerTroopRepresentation.highestAssignedId++;
        this.id = ServerTroopRepresentation.highestAssignedId;
        this.creationTime = Date.now();
        this.dirVector = Vector2_1.Vector2.Subtract(this.destination.position, this.position);
    }
    update(deltaTime) {
        this.dirVector = Vector2_1.Vector2.Subtract(this.destination.position, this.position);
        let movementVector = Vector2_1.Vector2.Multiply(this.dirVector.norm(), GameParameters_1.GameParameters.troopSpeed * deltaTime);
        this.position.moveBy(movementVector);
        this.debugTicker += deltaTime;
        if (this.debugTicker > 100) {
            this.debugTicker = 0;
        }
        // Check if intersected target along the way
        if (this.dirVector.magnitude() < GameParameters_1.GameParameters.cityRadius) {
            this.destination.interactWithTroop(this.ownerId);
            this.destroy();
        }
    }
    destroy() {
        this.destroyMe = true;
    }
    toTroopData() {
        return {
            destinationId: this.destination.id,
            dirVector: this.dirVector,
            ownerId: this.ownerId,
            creationTime: this.creationTime,
            x: this.position.x,
            y: this.position.y,
        };
    }
}
ServerTroopRepresentation.highestAssignedId = 0;
exports.default = ServerTroopRepresentation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmVyVHJvb3BSZXByZXNlbnRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZXJ2ZXIvR2FtZU9iamVjdFJlcHJlc2VudGF0aW9ucy9TZXJ2ZXJUcm9vcFJlcHJlc2VudGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esd0RBQXFEO0FBR3JELHNFQUE2RTtBQUU3RSxNQUFxQix5QkFBeUI7SUFlMUMsWUFBWSxRQUFpQixFQUFFLFdBQXFDLEVBQUUsT0FBZTtRQUpyRixjQUFTLEdBQUcsS0FBSyxDQUFDO1FBRWxCLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBR1osSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFFL0IseUJBQXlCLENBQUMsaUJBQWlCLEVBQUcsQ0FBQztRQUMvQyxJQUFJLENBQUMsRUFBRSxHQUFHLHlCQUF5QixDQUFDLGlCQUFpQixDQUFDO1FBQ3RELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRS9CLElBQUksQ0FBQyxTQUFTLEdBQUcsaUJBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRCxNQUFNLENBQUMsU0FBaUI7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUUsSUFBSSxjQUFjLEdBQUcsaUJBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRSwrQkFBTSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsQ0FBQztRQUM1RixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUVyQyxJQUFJLENBQUMsV0FBVyxJQUFJLFNBQVMsQ0FBQztRQUM5QixJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVELDRDQUE0QztRQUM1QyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEdBQUcsK0JBQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNqRCxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQztJQUNMLENBQUM7SUFFRCxPQUFPO1FBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVELFdBQVc7UUFDUCxPQUFPO1lBQ0gsYUFBYSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNsQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7WUFDekIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ3JCLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtZQUMvQixDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xCLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDckIsQ0FBQztJQUNOLENBQUM7O0FBeERNLDJDQUFpQixHQUFXLENBQUMsQUFBWixDQUFhO2tCQURwQix5QkFBeUIifQ==