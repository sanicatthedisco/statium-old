import { promises as fsPromises } from "fs";
import { parseString } from "xml2js";
import { GameParameters as Params } from "./GameParameters";
import { CityData, RegionData } from "./Communication";
import { Vector2 } from "./Vector2";

export default class MapBuilder {
    data: any;
    shapes: Vector2[][] = [];

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

    static pointsToVectors(rawPoints: number[]): Vector2[] {
        let points: Vector2[] = [];
        for (let i = 0; i < rawPoints.length; i += 2) {
            points.push(new Vector2(rawPoints[i], rawPoints[i+1]));
        }
        return points;
    }

    static findCentroid(shape: Vector2[]): Vector2 {
        // naive vertex centroid
        let xMean = 0;
        let yMean = 0;
        shape.forEach((v: Vector2) => {
            xMean += v.x;
            yMean += v.y;
        })
        xMean = xMean/shape.length;
        yMean = yMean/shape.length;

        return new Vector2(xMean, yMean);
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
            this.shapes.push(this.svgPointsToVectors(polygon.$.points))
        });

        this.shapes = this.adjustShapes(this.shapes, new Vector2(50, -70), 0.5);
    }

    svgPointsToVectors(pointString: string) {
        const vectorList: Vector2[] = [];
        const points: number[] = pointString.split(" ")
            .map((pt) => parseFloat(pt));

        for (let i = 0; i < points.length; i += 2) {
            vectorList.push(
                new Vector2(points[i], points[i+1])
            );
        }
        return vectorList;
    }

    adjustShapes(shapes: Vector2[][], offset: Vector2, scale: number): Vector2[][] {
        // Find smallest values of x and y among all the points
        let xMin = Params.width;
        let yMin = Params.height;
        shapes.forEach((shape) => {
            shape.forEach((v) => {
                if (v.x < xMin) xMin = v.x;
                if (v.y < yMin) yMin = v.y;
            });
        });

        // make this the new origin and transform all of the polygons to it
        // then apply scale and offset
        return shapes.map((shape) => (
            shape.map((v) => (
                new Vector2(
                    (v.x-xMin) * scale + offset.x,
                    (v.y-yMin) * scale + offset.y
                )
            ))
        ));
    }
    /*
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
    */

    buildRegionData(): RegionData[] {
        return this.shapes.map((shape, i, arr) => {
            let centroid = MapBuilder.findCentroid(shape);
            return {
                points: shape,
                cityPos: centroid,
                id: i
            }
        })
        
    }
}