import Player from "@vimeo/player";

export const getChapters = async (
  player: Player
): Promise<Player.VimeoChapter[]> => {
  const chapters = await player.getChapters();
  return chapters;
};
