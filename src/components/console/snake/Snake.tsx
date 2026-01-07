import { useEffect, useRef, useState } from "react";
import "./Snake.scss";
import { Sprite } from "./Sprite";

const SNAKE_GAME_WIDTH = 500;
const SNAKE_GAME_HEIGHT = 500;

const X_TILE_COUNT = 15;
const Y_TILE_COUNT = 15;

const TILE_WIDTH = SNAKE_GAME_WIDTH / X_TILE_COUNT;
const TILE_HEIGHT = SNAKE_GAME_HEIGHT / Y_TILE_COUNT;


export default function Snake() {

    const snakeCanvasReference = useRef<HTMLCanvasElement>(null);
    const applesEaten = useRef<HTMLSpanElement>(null);
    const mainSnakeDiv = useRef<HTMLDivElement>(null);
    const state = useState(Math.random());

    useEffect(() => {

        let STATE: SnakeState = "titleScreen";

        if (!snakeCanvasReference.current) return;

        let ctx = snakeCanvasReference.current.getContext("2d") as CanvasRenderingContext2D;
        let styles = snakeCanvasReference.current.style;

        if (!ctx || ctx == null) return;

        let ANITALISING_OFFSET = 1;


        if (applesEaten.current) {
            applesEaten.current.textContent = "0";
        }

        let COLORS = {
            snakeTileColor: {
                snakeBackgroundColorEven: styles.getPropertyValue("--snakeBackgroundColorEvent") || "#007e00",
                snakeBackgroundColoOdd: styles.getPropertyValue("--snakeBackgroundColorOdd") || "#005000",
                snakeBody: styles.getPropertyValue("--snakeBody") || "#0070ccff",
                appleColor: styles.getPropertyValue("--appleColor") || "#ff3300ff"
            }
        };

        let currentAnimationFrame = -1;
        let SNAKE_BODY: number[] = [convertXYToIndex(Math.floor(X_TILE_COUNT / 2), Math.floor(Y_TILE_COUNT / 2))];

        let SNAKE_CURRENT_DIR: SnakeDirection = "left";
        let SNAKE_CURRENT_DIR_NEXT: SnakeDirection = "left";

        let SNAKE_SPEED_TILES_PER_SECOND = 4 / 1;
        // let SNAKE_SPEED_PIXELS_PER_SECOND = (TILE_HEIGHT + TILE_WIDTH) / 2 * SNAKE_SPEED_TILES_PER_SECOND;

        let snakeOffset = 0;

        let deltaTime = 0;
        let lastTime = performance.now();

        let APPLE_INDEXES: number[] = [randomPosition()];
        let applesEatenCount = 0;

        const sprites = new Sprite("/snake/snakeSprite.png", 5, 4, 64, TILE_HEIGHT);
        let spritesLoaded = false;


        sprites.loadingPromise.then((e) => {
            spritesLoaded = true;
            console.log(e);
        });

        let SNAKE_DIRECTION_SPRITES: { [key: string]: ImageBitmap; } = {};

        function render() {
            let curr = performance.now();
            deltaTime = (curr - lastTime) / 1000;
            lastTime = curr;


            if (!ctx || !styles) return;
            if (STATE == "paused") {
            } else if (STATE == "titleScreen") {

            }

            if (!spritesLoaded) {
                currentAnimationFrame = requestAnimationFrame(render);
                return;
            }

            if (spritesLoaded && Object.keys(SNAKE_DIRECTION_SPRITES).length == 0) {
                //from_to
                SNAKE_DIRECTION_SPRITES = {
                    "bottom-right": sprites.get(0, 0)!,
                    "bottom-left": sprites.get(2, 0)!,
                    "top-right": sprites.get(0, 1)!,
                    "top-left": sprites.get(2, 2)!,

                    "bottom-top": sprites.get(2, 1)!,
                    "right-left": sprites.get(1, 0)!,
                    "top-bottom": sprites.get(2, 1)!,
                    "left-right": sprites.get(1, 0)!,

                    "head-bottom": sprites.get(4, 1)!,
                    "head-top": sprites.get(3, 0)!,
                    "head-right": sprites.get(4, 0)!,
                    "head-left": sprites.get(3, 1)!,

                    "tail-bottom": sprites.get(3, 2)!,
                    "tail-top": sprites.get(4, 3)!,
                    "tail-right": sprites.get(3, 3)!,
                    "tail-left": sprites.get(4, 2)!,

                };
            }

            ctx.clearRect(0, 0, TILE_WIDTH, SNAKE_GAME_HEIGHT);

            for (let x = 0; x <= X_TILE_COUNT; x++) {
                for (let y = 0; y <= Y_TILE_COUNT; y++) {
                    ctx.fillStyle = (x + y) % 2 == 0 ? COLORS.snakeTileColor.snakeBackgroundColorEven : COLORS.snakeTileColor.snakeBackgroundColoOdd;
                    ctx.fillRect(x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                }
            }

            for (let i = 0; i < APPLE_INDEXES.length; i++) {
                const apple = APPLE_INDEXES[i];
                const [x, y] = convertIndexToXY(apple);

                ctx.fillStyle = COLORS.snakeTileColor.appleColor;
                ctx.fillRect(x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
            }

            for (let i = 0; i < SNAKE_BODY.length - 1; i++) {
                const snake = SNAKE_BODY[i];
                const [x, y] = convertIndexToXY(snake);

                ctx.fillStyle = COLORS.snakeTileColor.snakeBody;
                // ctx.fillRect(x * TILE_WIDTH - ANITALISING_OFFSET, y * TILE_HEIGHT - ANITALISING_OFFSET, TILE_WIDTH + ANITALISING_OFFSET * 2, TILE_HEIGHT + ANITALISING_OFFSET * 2);

                const next = SNAKE_BODY[i + 1];
                const prev = SNAKE_BODY[i - 1];

                let sprite = null;

                const getSprite = (from: SnakeDirection | "top" | "bottom", to: SnakeDirection | "top" | "bottom") => {
                    let sprite = null;

                    if (from == "up") from = "top";
                    if (from == "down") from = "bottom";
                    if (to == "up") to = "top";
                    if (to == "down") to = "bottom";

                    if (from == "bottom" || from == "top") {
                        sprite = SNAKE_DIRECTION_SPRITES[from + "-" + to];
                    } else if (to == "bottom" || to == "top") {
                        sprite = SNAKE_DIRECTION_SPRITES[to + "-" + from];
                    } else {
                        sprite = SNAKE_DIRECTION_SPRITES[from + "-" + to];
                    }
                    return sprite;
                }

                if (Number.isNaN(prev) || i == 0) {
                    // Head
                    const toIndex = snake - next;
                    let to: SnakeDirection | "top" | "bottom" = getDirectonFromDistance(toIndex);
                    // if (to == "up") to = "top";
                    // if (to == "down") to = "bottom";

                    // sprite = SNAKE_DIRECTION_SPRITES["head-" + to];

                    sprite = getSprite(SNAKE_CURRENT_DIR, to);

                } else if (i >= SNAKE_BODY.length - 1) {
                    console.log("Tail");
                    // Tail
                    // const toIndex = snake - next;
                    const fromIndex = snake - prev;
                    // let to: SnakeDirection = getDirectonFromDistance(toIndex);
                    let from: SnakeDirection = getDirectonFromDistance(fromIndex);
                    sprite = getSprite(from, from);

                    let width = 0;
                    let height = 0;
                    let xAnchor = x * TILE_WIDTH;
                    let yAnchor = y * TILE_HEIGHT;

                    switch (from) {
                        case "right":
                            xAnchor + TILE_WIDTH - width;
                            break;
                        case "left":
                            width = TILE_WIDTH * snakeOffset + (TILE_WIDTH / 3);
                            break;
                        case "down":
                            yAnchor + TILE_HEIGHT - height;
                            break;
                        case "up":
                            height = TILE_HEIGHT * snakeOffset + (TILE_HEIGHT / 3);
                            break;
                    }



                    // switch(to){
                    //     case "right":
                    //         break
                    //     case "down":
                    //         break
                    // }

                    if (sprite) ctx.drawImage(sprite, xAnchor, yAnchor, width, height);
                    sprite = null;
                } else {
                    // Body
                    const toIndex = snake - next;
                    const fromIndex = snake - prev;
                    let to: SnakeDirection = getDirectonFromDistance(toIndex);
                    let from: SnakeDirection = getDirectonFromDistance(fromIndex);
                    sprite = getSprite(from, to);
                    // console.log(sprite);

                }
                if (sprite) ctx.drawImage(sprite, x * TILE_WIDTH, y * TILE_HEIGHT);

            }


            let firstBodyPart = SNAKE_BODY.length == 0 ? undefined : SNAKE_BODY[0];
            let lastBodyPart = SNAKE_BODY.length == 0 ? undefined : SNAKE_BODY[SNAKE_BODY.length - 1];

            if ((firstBodyPart && lastBodyPart) || (firstBodyPart == 0 && lastBodyPart == 0)) {
                let [x, y] = convertIndexToXY(firstBodyPart);
                ctx.fillStyle = COLORS.snakeTileColor.snakeBody;

                let offsetX = 0;
                let offsetY = 0;
                let snakeHeadDir: SnakeDirection | "top" | "bottom" = SNAKE_CURRENT_DIR;
                if (snakeHeadDir == "down") snakeHeadDir = "bottom";
                if (snakeHeadDir == "up") snakeHeadDir = "top";
                let sprite: ImageBitmap | null = SNAKE_DIRECTION_SPRITES["head-" + snakeHeadDir];
                console.log(snakeHeadDir, sprite);
                // Head
                switch (SNAKE_CURRENT_DIR) {
                    case "up":
                        offsetY = - (TILE_HEIGHT * snakeOffset);
                        break;
                    case "down":
                        offsetY = TILE_HEIGHT * snakeOffset;
                        break;
                    case "left":
                        offsetX = - (TILE_WIDTH * snakeOffset);
                        break;
                    case "right":
                        offsetX = TILE_WIDTH * snakeOffset;
                        break;
                }

                if (sprite) {
                    ctx.drawImage(sprite, (x * TILE_WIDTH) + offsetX - ANITALISING_OFFSET, (y * TILE_HEIGHT) + offsetY - ANITALISING_OFFSET, TILE_WIDTH + ANITALISING_OFFSET * 2, TILE_HEIGHT + ANITALISING_OFFSET * 2);
                } else {
                    ctx.fillRect((x * TILE_WIDTH) + offsetX - ANITALISING_OFFSET, (y * TILE_HEIGHT) + offsetY - ANITALISING_OFFSET, TILE_WIDTH + ANITALISING_OFFSET * 2, TILE_HEIGHT + ANITALISING_OFFSET * 2);
                }


                // Tail
                sprite = null;
                let beforeLast = SNAKE_BODY.length == 1 ? undefined : SNAKE_BODY[SNAKE_BODY.length - 2];
                if (beforeLast) {
                    const distance = beforeLast - lastBodyPart;
                    let tailDir: SnakeDirection | "top" | "bottom" = getDirectonFromDistance(distance);
                    if (tailDir == "up") tailDir = "top";
                    if (tailDir == "down") tailDir = "bottom";
                    sprite = SNAKE_DIRECTION_SPRITES["tail-" + tailDir];

                    offsetX = 0;
                    offsetY = 0;

                    switch (distance) {
                        case -1:
                            offsetX = -(TILE_WIDTH * snakeOffset);
                            break;
                        case 1:
                            offsetX = TILE_WIDTH * snakeOffset;
                            break;
                        case X_TILE_COUNT:
                            offsetY = TILE_HEIGHT * snakeOffset;
                            break;
                        case -X_TILE_COUNT:
                            offsetY = - (TILE_HEIGHT * snakeOffset);
                            break;
                    }
                }

                [x, y] = convertIndexToXY(lastBodyPart);

                if (sprite) {
                    ctx.drawImage(sprite, (x * TILE_WIDTH) + offsetX - ANITALISING_OFFSET, (y * TILE_HEIGHT) + offsetY - ANITALISING_OFFSET, TILE_WIDTH + ANITALISING_OFFSET * 2, TILE_HEIGHT + ANITALISING_OFFSET * 2);
                } else {
                    ctx.fillRect((x * TILE_WIDTH) + offsetX - ANITALISING_OFFSET, (y * TILE_HEIGHT) + offsetY - ANITALISING_OFFSET, TILE_WIDTH + ANITALISING_OFFSET * 2, TILE_HEIGHT + ANITALISING_OFFSET * 2);
                }

            }

            if (STATE == "running")
                update();

            if (STATE !== "stopped") {
                currentAnimationFrame = requestAnimationFrame(render);
            }
        }

        function update() {
            snakeOffset += Math.pow(deltaTime * SNAKE_SPEED_TILES_PER_SECOND, 0.9);

            // Wall Collision

            let newIndex = SNAKE_BODY.length == 0 ? undefined : SNAKE_BODY[0];
            if (!newIndex) return;

            let [x, y] = convertIndexToXY(newIndex);

            let offsetX = 0;
            let offsetY = 0;

            switch (SNAKE_CURRENT_DIR) {
                case "up":
                    offsetY = - (TILE_HEIGHT * snakeOffset);
                    break;
                case "down":
                    offsetY = TILE_HEIGHT * snakeOffset;
                    break;
                case "left":
                    offsetX = - (TILE_WIDTH * snakeOffset);
                    break;
                case "right":
                    offsetX = TILE_WIDTH * snakeOffset;
                    break;
            }

            if (offsetX != 0) {
                if (offsetX > 0) {
                    if (x + 1 >= X_TILE_COUNT) {
                        lost();
                        return;
                    }
                } else {
                    if (x - 1 < 0) {
                        lost();
                        return;
                    }
                }
            }

            if (offsetY != 0) {
                if (offsetY > 0) {
                    if (y + 1 >= Y_TILE_COUNT) {
                        lost();
                        return;
                    }
                } else {
                    if (y - 1 < 0) {
                        lost();
                        return;
                    }
                }
            }

            for (let i = 1; i < SNAKE_BODY.length; i++) {
                const [bx, by] = convertIndexToXY(SNAKE_BODY[i]);
                if (bx == x && by == y) {
                    lost();
                    return;
                }
            }

            if (snakeOffset < 1) return;

            let hasAppleEaten = false;

            for (let i = APPLE_INDEXES.length - 1; i >= 0; i--) {
                const apple = APPLE_INDEXES[i];
                const [appleX, appleY] = convertIndexToXY(apple);
                if (appleX == x && appleY == y) {
                    hasAppleEaten = true;
                    APPLE_INDEXES.splice(i, 1);
                }
            }

            if (hasAppleEaten) {
                appleEaten();
            } else {
                SNAKE_BODY.pop();
            }

            switch (SNAKE_CURRENT_DIR) {
                case "up":
                    newIndex -= X_TILE_COUNT;
                    break;
                case "down":
                    newIndex += X_TILE_COUNT;
                    break;
                case "left":
                    newIndex -= 1;
                    break;
                case "right":
                    newIndex += 1;
                    break;
            }


            SNAKE_BODY.unshift(newIndex);
            SNAKE_CURRENT_DIR = SNAKE_CURRENT_DIR_NEXT;
            snakeOffset = 0;


            if (newIndex > X_TILE_COUNT * Y_TILE_COUNT || newIndex < 0) {
                lost();
            }

            function lost() {
                STATE = "lost";
                console.log("lost");
                snakeOffset = 0;
            }

            function appleEaten() {
                applesEatenCount++;
                if (applesEaten.current) {
                    applesEaten.current.textContent = applesEatenCount + "";
                }
                APPLE_INDEXES.push(randomPosition());
            }

        }

        function getDirectonFromDistance(distance: number): SnakeDirection {
            switch (distance) {
                case 1:
                    return "left";
                case -1:
                    return "right";
                case X_TILE_COUNT:
                    return "up";
                case -X_TILE_COUNT:
                    return "down";
            }
            return "up";
        }

        function randomPosition() {
            return Math.floor(Math.random() * X_TILE_COUNT * Y_TILE_COUNT);
        }

        function reset() {
            SNAKE_BODY = [convertXYToIndex(Math.floor(X_TILE_COUNT / 2), Math.floor(Y_TILE_COUNT / 2))];

            SNAKE_CURRENT_DIR = "left";
            SNAKE_CURRENT_DIR_NEXT = "left";

            SNAKE_SPEED_TILES_PER_SECOND = 4 / 1;
            // SNAKE_SPEED_PIXELS_PER_SECOND = (TILE_HEIGHT + TILE_WIDTH) / 2 * SNAKE_SPEED_TILES_PER_SECOND;

            snakeOffset = 0;
        }

        function convertXYToIndex(x: number, y: number): number {
            return x + y * X_TILE_COUNT;
        }

        function convertIndexToXY(i: number): [number, number] {
            return [i % X_TILE_COUNT, Math.floor(i / X_TILE_COUNT)];
        }

        currentAnimationFrame = requestAnimationFrame(render);

        let captureKeys = true;

        const captureFlag = { capture: true };

        const onClick = (e: MouseEvent) => {
            if (!mainSnakeDiv.current || !mainSnakeDiv.current.contains(e.target as Node)) {
                captureKeys = false;
                STATE = "paused";
                return;
            }
            captureKeys = true;
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (!captureKeys) return;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            switch (e.key) {
                case "a":
                case "A":
                case "ArrowLeft":
                    if (SNAKE_CURRENT_DIR != "right") SNAKE_CURRENT_DIR_NEXT = "left";
                    break;

                case "d":
                case "D":
                case "ArrowRight":
                    if (SNAKE_CURRENT_DIR != "left") SNAKE_CURRENT_DIR_NEXT = "right";
                    break;

                case "w":
                case "W":
                case "ArrowUp":
                    if (SNAKE_CURRENT_DIR != "down") SNAKE_CURRENT_DIR_NEXT = "up";
                    break;

                case "s":
                case "S":
                case "ArrowDown":
                    if (SNAKE_CURRENT_DIR != "up") SNAKE_CURRENT_DIR_NEXT = "down";
                    break;

                case "Escape":
                    if (STATE == "paused" || STATE == "running") {
                        STATE = STATE == "paused" ? "running" : "paused";
                    }
                    break;

                case " ":
                    if (STATE == "titleScreen" || STATE == "lost") {
                        reset();
                        STATE = "running";
                    }

            }

        };

        document.addEventListener("click", onClick);
        document.addEventListener("keydown", onKeyDown, captureFlag);

        return () => {
            STATE = "stopped";
            cancelAnimationFrame(currentAnimationFrame);
            document.removeEventListener("click", onClick);
            document.removeEventListener("keydown", onKeyDown, captureFlag);
        };

    }, [snakeCanvasReference, state]);


    return <div className="snake" ref={mainSnakeDiv} style={{ width: SNAKE_GAME_WIDTH + "px" }}>
        <div className="snake-status">
            <div className="apples-eaten">
                <img src="/snake/apple.png" alt="Apple" className="apple" />
                <span className="current-apples-eaten-span" ref={applesEaten}></span>
            </div>
        </div>
        <canvas width={SNAKE_GAME_WIDTH} height={SNAKE_GAME_HEIGHT} ref={snakeCanvasReference}>Your device doesn't support canvas! So sadly you can't play Snake</canvas>
    </div>;
}

type SnakeState = "paused" | "running" | "titleScreen" | "stopped" | "lost";
type SnakeDirection = "up" | "down" | "left" | "right";