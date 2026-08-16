import * as React from "react";
import { IImage } from "./CellModels";

interface IImageCellComponentProps {
  imageCell: IImage;
  altText: string;
}

const ImageCellComponent: React.FunctionComponent<IImageCellComponentProps> = ({ imageCell, altText }) => {
  const [isBroken, setIsBroken] = React.useState<boolean>(imageCell.url.length === 0);

  if (isBroken) {
    return <span className="cg-grid__image-fallback" aria-label="Image unavailable">?</span>;
  }

  return (
    <img
      className="cg-grid__image"
      src={imageCell.url}
      alt={altText}
      onError={() => setIsBroken(true)}
    />
  );
};

export default ImageCellComponent;
