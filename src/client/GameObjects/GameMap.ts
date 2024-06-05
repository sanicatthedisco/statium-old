import { Container, Graphics, Polygon } from "pixi.js";
import { City } from "./City";
import MapBuilder from "../Utils/MapBuilder";
import { Scene } from "../Scenes/Scene";

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
    polygon: Polygon;
    graphics: Graphics;
    color: number;
    id: number;
    static highestAssignedId: number;

    constructor(polygon: Polygon, scene: Scene) {
        super();
        this.id = Region.highestAssignedId ++;

        this.polygon = polygon;
        this.color = 0xdddddd;
        this.graphics = new Graphics();
        this.addChild(this.graphics);
        this.draw();

        let centroid = MapBuilder.findCentroid(this.polygon);
        this.city = new City(centroid.x, centroid.y, scene, this.id);
        this.addChild(this.city);
    }

    draw() {
        this.graphics.clear();
        this.graphics.beginFill(this.color)
            .lineStyle(3, "white")
            .drawPolygon(this.polygon)
            .endFill();
    }
}