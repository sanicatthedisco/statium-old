import { Container, Graphics, Polygon } from "pixi.js";
import { City } from "./City";
import MapBuilder from "../../shared/Utils/MapBuilder";
import { Scene } from "../Scenes/Scene";
import { Vector2 } from "../../shared/Utils/Vector2";
import Color from "color";
import { GameObject } from "./GameObject";
import { Region } from "./Region";

export default class GameMap extends GameObject {
    regions: Region[];

    constructor(regions: Region[], scene: Scene) {
        super(0, 0, scene);
        this.regions = regions;
        this.regions.forEach((r) => {this.addChild(r)});
    }
}