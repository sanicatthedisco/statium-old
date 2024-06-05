import { Container, Graphics, Polygon } from "pixi.js";
import { City } from "./City";
import MapBuilder from "../Utils/MapBuilder";
import { Scene } from "../Scenes/Scene";
import { Vector2 } from "../Utils/Vector2";
import Color from "color";

export default class GameMap extends Container {
    regions: Region[];

    constructor(regions: Region[], scene: Scene) {
        super();
        this.regions = regions;
        this.regions.forEach((r) => {this.addChild(r)});
        scene.addChild(this);
    }
}

export class Region extends Container {
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
        super();
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
        console.log(this.color.hex());
        this.draw();
    }
}