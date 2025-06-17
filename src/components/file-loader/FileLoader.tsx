import React, { ChangeEventHandler } from "react";
import { Form, Button } from "react-bootstrap";

type FileLoaderProps = {
  onSelect: (file: File) => void
  className?: string
}

export const FileLoader = (props: FileLoaderProps) => {

  // let file: File | null = null;
  const [file, setFile] = React.useState<File | null>(null);
  const id = `file_${Math.random().toString(36).split('.')[1]}`;
  const onchange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const onsubmit: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (file) {
      props.onSelect && props.onSelect(file);
    }    
  };

  return (
    <div className={(props.className || "") + " row"}>
      <div className="col-auto">
        <Form.Label className="col-form-label" htmlFor={id}>PNG 画像を選択:</Form.Label>
      </div>
      <div className="col-auto">
        <Form.Control id={id} type="file" onChange={onchange} accept="image/png"/>
      </div>
      <div className="col-auto">
        <Button onClick={onsubmit}>読み込み</Button>
      </div>
    </div>
  );
};