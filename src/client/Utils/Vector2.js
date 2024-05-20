"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector2 = void 0;
var Vector2 = /** @class */ (function () {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector2.Add = function (v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    };
    Vector2.Subtract = function (v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    };
    Vector2.Multiply = function (v, s) {
        return new Vector2(v.x * s, v.y * s);
    };
    Vector2.prototype.setX = function (x) { this.x = x; };
    Vector2.prototype.setY = function (y) { this.y = y; };
    Vector2.prototype.magnitude = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };
    Vector2.prototype.norm = function () {
        var mag = this.magnitude();
        return new Vector2(this.x / mag, this.y / mag);
    };
    return Vector2;
}());
exports.Vector2 = Vector2;
