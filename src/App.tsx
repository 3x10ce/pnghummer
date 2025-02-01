import React from "react";

import { Header} from "./components/header/Header";
import { FileLoader } from "./components/file-loader/FileLoader";

import { PngData } from "./logics/png-data";

import "./styles.scss";

export const App = () => {
  const onSelect = async (file: File) => {
    const pngData = new PngData(await file.arrayBuffer());
    console.log(pngData);
  }
  return (
    <div className="container">
      <Header />
      <FileLoader onSelect={onSelect}/>
    </div>
  );
};