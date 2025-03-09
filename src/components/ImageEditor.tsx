import React from "react";

import "../styles.scss";
import { PngData } from "../logics/png-data";
import { PngImage, PngImageFilterType } from "../logics/png-image";
import { Form, InputGroup, OverlayTrigger, Tooltip } from "react-bootstrap";

type ImageViewProps = {
  data: PngData | null
}

enum ToolMode {
  None = 0,
  Pencil = 1,
  Hand = 2
}
export const ImageEditor = (props: ImageViewProps) => {

  const imageViewDiv = React.useRef<HTMLImageElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const image = React.useRef<PngImage | null>(null);;
  const [imageUrl, setImageUrl] = React.useState("");
  const [toolMode, setToolMode] = React.useState<ToolMode>(ToolMode.None);

  const scrollPosition = React.useRef({ x: 0, y: 0 });
  const clientPosition = React.useRef({ x: 0, y: 0 });
  const drawPixels = React.useRef<Array<[number, number]>>([]);

  const [showFilterType, setShowFilterType] = React.useState(false);

  React.useEffect(() => {
    if (props.data) {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      PngImage.from(props.data).then((pngImage) => {
        console.log('Loaded PNG Image:');
        console.log(`  - width: ${pngImage.pngData.IHDR.width}`);
        console.log(`  - height: ${pngImage.pngData.IHDR.height}`);
        console.log(`  - bitDepth: ${pngImage.pngData.IHDR.bitDepth}`);
        console.log(`  - colorType: ${pngImage.pngData.IHDR.colorType}`);
        console.log(`  - compressionMethod: ${pngImage.pngData.IHDR.compressionMethod}`);
        console.log(`  - filterMethod: ${pngImage.pngData.IHDR.filterMethod}`);
        console.log(`  - interlaceMethod: ${pngImage.pngData.IHDR.interlaceMethod}`);
        console.log(`  - scanlines: ${pngImage.imageData.length}`);


        updateImageUrl(pngImage);
      });
    }
  }, [props.data]);

  React.useEffect(() => {
    const pngImage = image.current;
    if (pngImage === null) return;

    // draw filter type
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 5, pngImage.imageData.length);
    if (showFilterType) {
      for (let y = 0; y < pngImage.imageData.length; y++) {
        const scanline = pngImage.imageData[y];
        switch(scanline.filterType) {
          case PngImageFilterType.None:
            ctx.fillStyle = 'black'; // No filter
            break;
          case PngImageFilterType.Sub:
            ctx.fillStyle = 'blue'; // Sub filter
            break;
          case PngImageFilterType.Up:
            ctx.fillStyle = 'red'; // Up filter
            break;
          case PngImageFilterType.Average:
            ctx.fillStyle = 'yelow'; // Average filter
            break;
          case PngImageFilterType.Paeth:
            ctx.fillStyle = 'green'; // Paeth filter
            break;
          default:
            ctx.fillStyle = 'magenta'; // Unknown
        }
        ctx.fillRect(0, y, 5, 1);
      }
    }
  }, [imageUrl, showFilterType]);

  const glitch = () => {
    // clear canvas
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(1, 0, canvasRef.current.width, canvasRef.current.height);

    // Glitch PNG image
    drawPixels.current.forEach(p => {
      const [x, y] = p;
      image.current?.setRawPixel(x, y, Math.floor(Math.random() * 256))
    })
    drawPixels.current = [];

    updateImageUrl(image.current as PngImage);
  }

  const updateImageUrl = (pngImage: PngImage) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    image.current = pngImage;

    pngImage.getPngData().then((pngData) => {
      console.log('updateImageUrl');
      setImageUrl(URL.createObjectURL(pngData.toBlob()));
      
      console.log('getPngData');
    });
  }

  const onMousedown: React.MouseEventHandler<HTMLImageElement> = (event) => {
    event.preventDefault();
    if (!imageViewDiv || !imageViewDiv.current) return;
    const current = imageViewDiv.current as HTMLElement;
    const rect = current.getBoundingClientRect();
    const offset = {
      x: event.clientX + current.scrollLeft- rect.left,
      y: event.clientY + current.scrollTop - rect.top
    };
    // console.log(`mousedown ${event.button}`);
    // 既にツールが選択されている場合は None に戻す
    if (toolMode !== ToolMode.None) {
      setToolMode(ToolMode.None);
      return;
    }

    if (event.button === 1) {
      // Hand mode
      setToolMode(ToolMode.Hand);
      scrollPosition.current = {
        x: current.scrollLeft,
        y: current.scrollTop
      };
      clientPosition.current = {
        x: event.clientX,
        y: event.clientY
      };
      current.style.cursor = "move";
    } else if (event.button === 0) {
      // Pencil mode
      if (!imageViewDiv || !imageViewDiv.current) return;
      const current = imageViewDiv.current as HTMLElement;
      setToolMode(ToolMode.Pencil);
      current.style.cursor = "crosshair";
      drawPixels.current = [[offset.x, offset.y]];
    }
  }

  const onMouseup: React.MouseEventHandler<HTMLImageElement> = (event) => {
    event.preventDefault();
    // console.log(`mouseup ${event.button}`);

    // ペンモードなら、描画終了処理
    if (toolMode === ToolMode.Pencil) {
      glitch();
    }
    // ツール選択を None に戻す
    setToolMode(ToolMode.None);
    
    if (!imageViewDiv || !imageViewDiv.current) return;
    const current = imageViewDiv.current as HTMLElement;
    current.style.cursor = "default";
  }

  const onMousemove: React.MouseEventHandler<HTMLImageElement> = (event) => {
    event.preventDefault();
    if (!imageViewDiv || !imageViewDiv.current) return;
    const current = imageViewDiv.current as HTMLElement;
    
    const rect = current.getBoundingClientRect();
    const offset = {
      x: event.clientX + current.scrollLeft- rect.left,
      y: event.clientY + current.scrollTop - rect.top
    };
    // console.log(`mousemove ${offset.x}, ${offset.y}`);
    if (toolMode === ToolMode.Hand) {
      // ハンドモード: 画面スクロール
      current.scrollLeft = scrollPosition.current.x - (event.clientX - clientPosition.current.x);
      current.scrollTop = scrollPosition.current.y - (event.clientY - clientPosition.current.y);
    } else if (toolMode === ToolMode.Pencil) {
      // ペンモード: 描画
      drawPixels.current = [...drawPixels.current, [offset.x, offset.y]]
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = 'white';
      ctx.fillRect(offset.x, offset.y, 1, 1);
    }

  }

  const onMouseleave: React.MouseEventHandler<HTMLImageElement> = (event) => {
    event.preventDefault();

    // ペンモードなら、描画終了処理
    if (toolMode === ToolMode.Pencil) {
      glitch();
    }

    // ツール選択を None に戻す
    setToolMode(ToolMode.None);
    if (!imageViewDiv || !imageViewDiv.current) return;
    const current = imageViewDiv.current as HTMLElement;
    current.style.cursor = "default";
  }

  const onMouseenter: React.MouseEventHandler<HTMLImageElement> = (event) => {
    event.preventDefault();
  }

  const tooltip = (<Tooltip id="scanlineFilterTooltip">
    <p>PNG 画像の スキャンラインフィルターの種類を次の色で表示します。詳細はPNG仕様書を参照してください</p>
    <ul>
      <li>黒: None</li>
      <li>青: Sub</li>
      <li>赤: Up</li>
      <li>黄色: Average</li>
      <li>緑: Paeth</li>
    </ul>
  </Tooltip>)
  return (
    <>
      <Form className="row justify-content fs-6">
        <div className="col-auto">
          <Form.Check
            id="cb_showFilterType"
            checked={showFilterType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowFilterType(e.target.checked)}
            label="Scanline Filter を表示"
          />
        </div>
        <div className="col-auto">
          <OverlayTrigger placement="bottom" overlay={tooltip}>
            <span className="help-text">これは何?</span>
          </OverlayTrigger>
        </div>
      </Form>
      <div className="image-view" ref={imageViewDiv}>
        {imageUrl && (
          <img className="previewimg" src={imageUrl}
            onMouseDown={onMousedown} onMouseUp={onMouseup} onMouseMove={onMousemove}
            onMouseEnter={onMouseenter} onMouseLeave={onMouseleave}/>
        )}
        {image.current && (
          <canvas className="editpreview" ref={canvasRef}
            width={image.current?.pngData.IHDR.width} height={image.current?.pngData.IHDR.height} />
        )}
      </div>
    </>
  );
};

