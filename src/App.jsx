import React from "react";

import { Header} from "./components/header/Header";
import { FileLoader } from "./components/file-loader/FileLoader";

export const App = () => {
  const onSelect = (file) => {
    console.log(file);
  }
  return (
    <div className="container">
      <Header />
      <FileLoader onSelect={onSelect}/>
    </div>
  );
};