export class Vector2 {
	x: number;
	y: number;

	static Add(v1: Vector2, v2: Vector2) {
		return new Vector2(v1.x + v2.x, v1.y + v2.y);
	}
	static Subtract(v1: Vector2, v2: Vector2) {
		return new Vector2(v1.x - v2.x, v1.y - v2.y);
	}
	static Multiply(v: Vector2, s: number) {
		return new Vector2(v.x * s, v.y * s);
	}

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	setX(x: number) { this.x = x; }
	setY(y: number) { this.y = y; }

	magnitude() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}

	norm() {
		let mag = this.magnitude();
		return new Vector2(this.x / mag, this.y / mag);
	}
}