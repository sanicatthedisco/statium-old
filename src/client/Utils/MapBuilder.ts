import { promises as fsPromises } from "fs";
import { Graphics, IPointData, Polygon } from "pixi.js";
import { parseString } from "xml2js";
import { GameParameters as Params } from "./GameParameters";
import GameMap, { Region } from "../GameObjects/GameMap";
import { Scene } from "../Scenes/Scene";

export default class MapBuilder {
    data: any;
    polygons: Polygon[] = [];

    static changePointShape(rawPoints: number[]) {
        let points: any = [];
        for (let i = 0; i < rawPoints.length; i += 2) {
            points.push({
                x: rawPoints[i],
                y: rawPoints[i+1],
            })
        }
        return points;
    }

    static findCentroid(polygon: Polygon): IPointData {
        // naive vertex centroid
        let points = this.changePointShape(polygon.points);
        let xMean = 0;
        let yMean = 0;
        points.forEach((p: IPointData) => {
            xMean += p.x;
            yMean += p.y;
        })
        xMean = xMean/points.length;
        yMean = yMean/points.length;

        return {x: xMean, y: yMean};
    }

    constructor(data: string) {
        parseString(data, (err, res) => {
            if (err) {
                throw err;
            }
            this.data = res;
        });

        let polygons: any[] = this.data.svg.polygon;
        polygons.forEach((polygon) => {
            this.polygons.push(this.svgPointsToPolygon(polygon.$.points))
        });

        this.polygons = this.adjustPolygons(this.polygons, 50, -70, 0.5);
    }

    svgPointsToPolygon(pointString: string) {
        let points: IPointData[] = [];
        const pointArr = pointString.split(" ").map((pt) => (parseFloat(pt)));
        return new Polygon(pointArr);
    };

    adjustPolygons(polygons: Polygon[], offsetX: number, offsetY: number, scale: number) {
        // Find smallest values of x and y among all the points
        let xMin = Params.width;
        let yMin = Params.height;
        polygons.forEach((p) => {
            MapBuilder.changePointShape(p.points).forEach(({x, y}: {x: number, y: number}) => {
                if (x < xMin) xMin = x;
                if (y < yMin) yMin = y;
            });
        });

        // make this the new origin and transform all of the polygons to it
        // then apply scale and offset
        return polygons.map((p) => (
            new Polygon(
                MapBuilder.changePointShape(p.points).map(({x, y}: {x: number, y: number}) => (
                    {
                        x: (x-xMin) * scale + offsetX,
                        y: (y-yMin) * scale + offsetY
                    }
                ))
            )
        ))
    }

    buildGraphics() {
        const gr = new Graphics();
        this.polygons.forEach((polygon) => {
            gr.lineStyle(2, "black").drawPolygon(polygon).endFill();
        });
        return gr;
    }

    buildMap(scene: Scene) {
        return new GameMap(
            this.polygons.map((p) => (new Region(p, scene))),
            scene
        );
    }
}