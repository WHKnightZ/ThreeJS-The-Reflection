import { game } from "../configs/constants";

declare global {
  interface Window {
    game: typeof game;
    handleAddLink: () => void;
    handleRemoveLink: (id: string) => void;
  }
}
