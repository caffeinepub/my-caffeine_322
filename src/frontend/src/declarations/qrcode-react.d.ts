declare module "qrcode.react" {
  import type { SVGProps } from "react";
  export interface QRCodeSVGProps extends SVGProps<SVGSVGElement> {
    value: string;
    size?: number;
    fgColor?: string;
    bgColor?: string;
    level?: "L" | "M" | "Q" | "H";
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      x?: number;
      y?: number;
      height?: number;
      width?: number;
      excavate?: boolean;
    };
  }
  export function QRCodeSVG(props: QRCodeSVGProps): JSX.Element;
  export function QRCodeCanvas(props: QRCodeSVGProps): JSX.Element;
}
