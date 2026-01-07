import type { LoadingAnimation } from "../components/backgroundAnimation/LoadingAnimationContext";

export default class ImageLoadManager {

    private images: HTMLImageElement[] = [];
    private key: string;
    private loadingAnimation: LoadingAnimation;

    constructor(loadingAnimation: LoadingAnimation, key: string) {
        this.key = key;
        this.loadingAnimation = loadingAnimation;
    }

    init() {
        this.loadingAnimation.addLoadingState(this.key);
    }

    public onRefAdd = ((el: HTMLImageElement) => {
        if (el == null) return;
        if (el.complete) return;
        this.images.push(el);
        this.init();
    }).bind(this);

    public onLoad = ((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        this.checkLoadedImages(e);
    }).bind(this);

    public onError = ((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        this.checkLoadedImages(e);
    }).bind(this);

    private checkLoadedImages(e: React.SyntheticEvent<HTMLImageElement, Event>) {
        const element = e.currentTarget;
        if (!element) return;
        this.images = this.images.filter(e => e !== element);
        if (this.images.length == 0 && this.loadingAnimation) {
            this.loadingAnimation.removeLoadingState(this.key);
        }
    }

}