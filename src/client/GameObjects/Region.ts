import { Polygon, Graphics, FederatedPointerEvent } from "pixi.js";
import { Vector2 } from "../../shared/Utils/Vector2";
import { Scene } from "../Scenes/Scene";
import { City } from "./City";
import { GameObject } from "./GameObject";
import Color from "color";
import { GameParameters as Params } from "../../shared/Utils/GameParameters";

export class Region extends GameObject {
    city: City;
    shape: Vector2[];
    polygon: Polygon;
    graphics: Graphics;
    baseColor: Color;
    color: Color;
    id: number;
    static highestAssignedId: number;

    lastTroopCount: number = -1;

    static vectorsToPolygon(shape: Vector2[]): Polygon {
        let flattenedPoints: number[] = [];
        shape.forEach((v) => {
            flattenedPoints.push(v.x);
            flattenedPoints.push(v.y);
        });
        return new Polygon(flattenedPoints);
    }

    constructor(shape: Vector2[], city: City, scene: Scene) {
        super(0, 0, scene);
        this.id = Region.highestAssignedId ++;

        this.shape = shape;
        this.baseColor = Params.defaultCityColor.lighten(0.4);
        this.color = this.baseColor;
        this.graphics = new Graphics();
        this.addChild(this.graphics);
        this.city = city;

        this.polygon = Region.vectorsToPolygon(this.shape);

        if (this.city.ownerId) this.updateColor(this.city.color);
        this.draw();

        this.eventMode = "dynamic";
        this.on("pointertap", this.onClick, this);
    }

    update() {
        this.doArcaneColorWizardry();
    }

    onClick(e: FederatedPointerEvent) {
        this.scene.manageSelection(this.city, e);
    }

    draw() {
        this.graphics.clear();
        this.graphics.beginFill(this.color.hex())
            .lineStyle(3, Color("white").hex())
            .drawPolygon(this.polygon)
            .endFill();
    }

    updateColor(cityColor: Color) {
        this.baseColor = cityColor;
    }

    // We will not speak of this again
    doArcaneColorWizardry() {
        if (this.lastTroopCount != this.city.troopCount) {
            let maxtc = this.city.ownerId ? Params.maxTroopCount * 0.8: Params.maxTroopCountUnowned;
            let normtc = this.city.troopCount / maxtc;
            this.color = this.baseColor.lightness(this.baseColor.l() * 1.05).mix(Color("white"), 0.6* (1-normtc));
            this.draw();

            this.lastTroopCount = this.city.troopCount;
        }
    }
}