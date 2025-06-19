import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Container, Modal } from "react-bootstrap";

import { Header } from "./components/header/Header";
import { FileLoader } from "./components/file-loader/FileLoader";

import { PngData } from "./logics/png-data";

import "./styles.scss";
import { ImageEditor } from "./components/ImageEditor";
import { HelpModal } from "./components/HelpModal";

export const App = () => {
  // const pngImage: PngImage | null = null;
  // const [imageSrc, setImageSrc] = React.useState("");
  const [pngData, setPngData] = React.useState<PngData | null>(null);
  const [errorMessage, setErrorMessage] = React.useState("");

  const [showHelp, setShowHelp] = React.useState(false);

  const onSelect = async (file: File) => {
    try {
      setPngData(new PngData(await file.arrayBuffer()));
    } catch (e) {
      setErrorMessage(
        `エラーが発生しました。: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
      console.error(e);
    }
  };
  return (
    <>
      <Header />
      <Container>
        <div className="row mt-2">
          <FileLoader className="col-auto" onSelect={onSelect} />
          <Button
            className="col-auto btn-secondary"
            onClick={() => setShowHelp(true)}
          >
            ヘルプ
          </Button>
        </div>
        <hr />
        <div className="mt-2">
          <ImageEditor data={pngData} />
        </div>
      </Container>
      <Modal centered show={!!errorMessage} onHide={() => setErrorMessage("")}>
        <Modal.Header closeButton>
          <Modal.Title>エラー</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
      </Modal>
      <HelpModal show={!!showHelp} onHide={() => setShowHelp(false)} />
    </>
  );
};
