import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from "react-bootstrap";


import { Header} from "./components/header/Header";
import { FileLoader } from "./components/file-loader/FileLoader";

import { PngData } from "./logics/png-data";

import "./styles.scss";
import { PngImage } from "./logics/png-image";
import { ImageEditor } from "./components/ImageEditor";

export const App = () => {


  let pngImage: PngImage | null = null;
  let [imageSrc, setImageSrc] = React.useState("");
  let [pngData, setPngData] = React.useState<PngData | null>(null);
  const onSelect = async (file: File) => {
    setPngData(new PngData(await file.arrayBuffer()));

  }
  return (
    <>
      <Header />
      <Container>
        <p className="mt-3"><FileLoader onSelect={onSelect}/></p>
        
        <ImageEditor data={pngData} />
      </Container>
    </>
  );
};