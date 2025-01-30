import React from "react";


export const FileLoader = (props) => {

  let file = null;
  const onchange = (e) => {
    if (e?.target.files.length > 0) {
      file = e.target.files[0];
    }
  };

  const onsubmit = () => {
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