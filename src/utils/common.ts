import { APP_NAME } from "../configs/constants";

export const getAppName = () => APP_NAME;

export const flipHorizontal = (image: HTMLImageElement) => {
  const width = image.width;
  const height = image.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  context.translate(width, 0);
  context.scale(-1, 1);
  context.drawImage(image, 0, 0);

  image = new Image();
  image.src = canvas.toDataURL("image/png");

  return new Promise((res) => (image.onload = () => res(image)));
};
