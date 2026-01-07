import { useEffect, useState } from "react";

type Props = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
    srcFunc: () => Promise<string>;
}


export default function AsyncImage({ srcFunc, ...atts }: Props) {
    const [src, setSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        (async () => {
            const result = await srcFunc();
            setSrc(result);
        })();
    }, []);

    return src && <img {...atts} src={src}></img>
}