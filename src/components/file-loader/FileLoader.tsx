import React, { ChangeEventHandler } from "react";

type FileLoaderProps = {
  onSelect: (file: File) => void
}

export const FileLoader = (props: FileLoaderProps) => {

  let file: File | null = null;
  const onchange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      file = e.target.files[0];
    }
  };

  const onsubmit: React.MouseEventHandler<HTMLInputElement> = (e) => {
    if (file) {
      props.onSelect && props.onSelect(file);
    }    
  };

  return (
    <div className="file-loader">
      <input type="file" onChange={onchange} accept="image/*"/>
      <input type="submit" onClick={onsubmit} value="Load" />
    </div>
  );
};