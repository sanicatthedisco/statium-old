import { ButtonContainer, Input } from "@pixi/ui";
import { BitmapText, Graphics } from "pixi.js";

export class StylizedText extends BitmapText {
    constructor(text: string, size: number, color: number, x: number, y: number) {
        super(text, {
            fontName: "TroopCountFont",
            fontSize: size,
            align: "center",
        });
        this.anchor.set(0.5, 0.5);
        this.roundPixels = true;
        this.x = x;
        this.y = y;
        this.tint = color;
    }
}

export class StylizedButton extends ButtonContainer {
    static colors = {
        default: 0xaaaaaa,
        hover: 0x999999,
        pressed: 0x777777,
    };

    color: number = 0xaaaaaa;
    graphics: Graphics;
    w: number;
    h: number;
    text: string;
    bitmapText: BitmapText;

    constructor(text: string, x: number, y: number, width: number, height: number, 
        onPressCallback=()=>{}) {
        
        super();
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.text = text;

        this.graphics = new Graphics();
        this.bitmapText = new BitmapText(this.text, {
                fontName: "TroopCountFont",
                fontSize: 25,
                align: "center"
        })
        this.bitmapText.anchor.set(0.5, 0.5);
        this.bitmapText.roundPixels = true;

        this.draw();
        this.addChild(this.graphics);
        this.addChild(this.bitmapText);

        this.onHover.connect(() => {
            this.color = StylizedButton.colors.hover;
            this.draw();
        });
        this.onOut.connect(() => {
            this.color = StylizedButton.colors.default;
            this.draw();
        });
        this.onDown.connect(() => {
            this.color = StylizedButton.colors.pressed;
            this.draw();
        })
        this.onUp.connect(() => {
            this.color = StylizedButton.colors.hover;
            this.draw();
        });

        this.onPress.connect(onPressCallback);
    }

    draw() {
        this.graphics.clear();
        this.graphics.beginFill(this.color)
            .drawRoundedRect(-this.w/2, -this.h/2, this.w, this.h, 5)
            .endFill();
    }
}

export class StylizedInputFactory {
    color: number = 0xcccccc;
    textColor: number = 0xffffff;

    buildInput(x: number, y: number, w: number, h: number) {
        let graphics = new Graphics().beginFill(this.color);
        graphics.drawRoundedRect(0, 0, w, h, 5);
        graphics.endFill();

        let i = new Input({
            bg: graphics,
            placeholder: "Enter new room ID",
            padding: 0,
            align: "center",
            textStyle: {fill: this.textColor}
        });
        i.x = x-w/2;
        i.y = y-h/2;
        
        return i;
    }
}