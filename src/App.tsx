import React from "react";

import { Header} from "./components/header/Header";
import { FileLoader } from "./components/file-loader/FileLoader";

import { PngData } from "./logics/png-data";

import "./styles.scss";
import { PngImageGlitcher } from "./logics/png-image";

export const App = () => {


  let pngImageGlitcher: PngImageGlitcher | null = null;
  let [imageSrc, setImageSrc] = React.useState("");
  let pngData: PngData | null = null;
  const onSelect = async (file: File) => {
    pngData = new PngData(await file.arrayBuffer());
    console.log(pngData);
    console.log(pngData.toBlob());
    
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    pngImageGlitcher = await PngImageGlitcher.from(pngData);
    const pngImageGlitched = (await pngImageGlitcher.getImage()).toBlob()
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