import React from "react";

import { Header} from "./components/header/Header";
import { FileLoader } from "./components/file-loader/FileLoader";

import { PngData } from "./logics/png-data";

import "./styles.scss";
import { PngImage } from "./logics/png-image";

export const App = () => {


  let pngImage: PngImage | null = null;
  let [imageSrc, setImageSrc] = React.useState("");
  let pngData: PngData | null = null;
  const onSelect = async (file: File) => {
    pngData = new PngData(await file.arrayBuffer());
    console.log(pngData);
    console.log(pngData.toBlob());
    
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    pngImage = await PngImage.from(pngData);

    // glitch 
    for(let i = 0; i < 100; i++) {
      const x = Math.floor(Math.random() * pngImage.pngData.IHDR.width);
      const y = Math.floor(Math.random() * pngImage.pngData.IHDR.height);
      pngImage.setRawPixel(x, y, Math.floor(Math.random() * 256));
    }
    const pngImageGlitched = (await pngImage.getPngData()).toBlob()
    console.log(pngImageGlitched);
    setImageSrc(URL.createObjectURL(pngImageGlitched));
  }
  return (
    <div className="container">
      <Header />
      <FileLoader onSelect={onSelect}/>

      <img src={imageSrc} alt="" className="previewimg"/>
    </div>
  );
};