import React from "react";

import { Header} from "./components/header/Header";
import { FileLoader } from "./components/file-loader/FileLoader";

import { PngData } from "./logics/png-data";

import "./styles.scss";

export const App = () => {

  let pngData: PngData | null = null;
  let [imageSrc, setImageSrc] = React.useState("");
  const onSelect = async (file: File) => {
    pngData = new PngData(await file.arrayBuffer());
    
    console.log(pngData);

    // preview image
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(URL.createObjectURL(pngData.toBlob()));
    
  }
  return (
    <div className="container">
      <Header />
      <FileLoader onSelect={onSelect}/>

      <img src={imageSrc} alt="" className="previewimg"/>
    </div>
  );
};