export default class Statics {

    public static TECHNOLOGIE_SIZE = "var(--technology-size, 32px)";//
    public static TECHNOLOGIE_CIRCLE_PADDING = 5;
    public static THEME_COLORS: string[] = [
        "#2f0140",
        "#540863",
        "#92487A",
        "#E49BA6",
        "#FFD3D5"
    ];
    public static BACKGROUND_ANIMATION_MARGIN_INLINE = 20;
    public static BACKGROUND_ANIMATION_MIN_TIME = 120;
    public static BACKGROUND_ANIMATION_MAX_TIME = 300;
    public static BACKGROUND_ANIMATION_MAX_SIZE = 8;

    public static isDarkMode = false;

    public static TITLE_SUFFIX = "Darius PF - ";

    static {
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

}