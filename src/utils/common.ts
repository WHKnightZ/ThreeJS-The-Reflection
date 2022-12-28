import { APP_NAME, SCREEN_HEIGHT } from "../configs/constants";

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

export const flipVertical = (image: HTMLImageElement) => {
  const width = image.width;
  const height = image.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  context.translate(0, 0);
  context.scale(1, -1);
  context.drawImage(image, 0, -image.height);

  image = new Image();
  image.src = canvas.toDataURL("image/png");

  return new Promise((res) => (image.onload = () => res(image)));
};

export const resize = (image: HTMLImageElement, scale = 1) => {
  const width = image.width * scale;
  const height = image.height * scale;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);

  image = new Image();
  image.src = canvas.toDataURL("image/png");

  return new Promise((res) => (image.onload = () => res(image)));
};

export const getImageSrc = (src: string, ext: "png" | "jpg" | "svg" = "png") => `/static/images/${src}.${ext}`;

export const checkIsReflected = (y: number) => y > SCREEN_HEIGHT / 2;
