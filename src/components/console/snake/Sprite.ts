export class Sprite {

    private img: HTMLImageElement = document.createElement("img");
    public url: string;
    public spriteCountX: number;
    public spriteCountY: number;
    private tileSize: number;
    private targetSize: number;
    public sprites: SpriteT[] = [];
    public loadingPromise: Promise<SpriteT[]>;

    constructor(url: string, spriteCountX: number, spriteCountY: number, tileSize: number, targetSize: number) {
        this.url = url;
        this.spriteCountX = spriteCountX;
        this.spriteCountY = spriteCountY;
        this.tileSize = tileSize;
        this.targetSize = targetSize;
        this.img.src = url;
        this.loadingPromise = new Promise((resolve) => {
            this.img.onload = async () => {
                await this.onload();
                resolve(this.sprites);
            };
        });
    }

    private async onload() {
        const mainImage = await createImageBitmap(this.img);
        for (let y = 0; y < this.spriteCountY; y++) {
            for (let x = 0; x < this.spriteCountX; x++) {
                const cropped = await createImageBitmap(
                    mainImage,
                    x * this.tileSize,
                    y * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );

                // Optional scaling
                const canvas = document.createElement("canvas");
                canvas.width = this.targetSize;
                canvas.height = this.targetSize;
                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(cropped, 0, 0, this.targetSize, this.targetSize);
                const bitmap = await createImageBitmap(canvas);

                this.sprites.push({ x, y, bitmap });
            }
        }
    }

    public get(x: number, y: number): ImageBitmap | undefined {
        return this.sprites.find(e => e.x == x && e.y == y)?.bitmap;
    }

}

export type SpriteT = {
    x: number;
    y: number;
    bitmap: ImageBitmap;
}