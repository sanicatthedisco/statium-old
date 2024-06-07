import { Polygon, Graphics } from "pixi.js";
import { Vector2 } from "../../shared/Utils/Vector2";
import { Scene } from "../Scenes/Scene";
import { City } from "./City";
import { GameObject } from "./GameObject";
import Color from "color";

export class Region extends GameObject {
    city: City;
    shape: Vector2[];
    polygon: Polygon;
    graphics: Graphics;
    color: Color;
    id: number;
    static highestAssignedId: number;

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
        this.color = Color(0xdddddd);
        this.graphics = new Graphics();
        this.addChild(this.graphics);

        this.city = city;
        //this.addChild(this.city);

        this.polygon = Region.vectorsToPolygon(this.shape);
        this.draw();
    }

    draw() {
        this.graphics.clear();
        this.graphics.beginFill(this.color.hex())
            .lineStyle(3, Color("white").hex())
            .drawPolygon(this.polygon)
            .endFill();
    }

    updateColor(cityColor: Color) {
        this.color = cityColor.lightness(cityColor.l() * 1.2);
        this.draw();
    }
}