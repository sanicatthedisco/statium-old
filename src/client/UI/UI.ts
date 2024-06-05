import { ButtonContainer, Input } from "@pixi/ui";
import Color from "color";
import { BitmapText, Graphics } from "pixi.js";

export class StylizedText extends BitmapText {
    constructor(text: string, size: number, color: Color, x: number, y: number) {
        super(text, {
            fontName: "TroopCountFont",
            fontSize: size,
            align: "center",
        });
        this.anchor.set(0.5, 0.5);
        this.roundPixels = true;
        this.x = x;
        this.y = y;
        this.tint = color.hex();
    }
}

export class StylizedButton extends ButtonContainer {
    static colors = {
        default: Color(0xaaaaaa),
        hover: Color(0x999999),
        pressed: Color(0x777777),
    };

    color: Color = StylizedButton.colors.default;
    graphics: Graphics;
    w: number;
    h: number;
    text: string | null;
    bitmapText?: BitmapText;

    constructor(text: string | null, x: number, y: number, width: number, height: number, 
        onPressCallback=()=>{}) {
        
        super();
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;

        this.text = text;

        this.graphics = new Graphics();
        
        if (this.text) {
            this.bitmapText = new BitmapText(this.text, {
                    fontName: "TroopCountFont",
                    fontSize: 25,
                    align: "center"
            });
            this.bitmapText.anchor.set(0.5, 0.5);
            this.bitmapText.roundPixels = true;
        }
        

        this.draw();
        this.addChild(this.graphics);
        if (this.bitmapText) this.addChild(this.bitmapText);

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
        this.graphics.beginFill(this.color.hex())
            .drawRoundedRect(-this.w/2, -this.h/2, this.w, this.h, 5)
            .endFill();
    }
}

export class StylizedInputFactory {
    color: Color = Color(0xcccccc);
    textColor: Color = Color(0xffffff);

    buildInput(placeholder: string, x: number, y: number, w: number, h: number) {
        let graphics = new Graphics().beginFill(this.color.hex());
        graphics.drawRoundedRect(0, 0, w, h, 5);
        graphics.endFill();

        let i = new Input({
            bg: graphics,
            placeholder: placeholder,
            padding: 0,
            align: "center",
            textStyle: {fill: this.textColor.hex()}
        });
        i.x = x-w/2;
        i.y = y-h/2;
        
        return i;
    }
}