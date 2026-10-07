import { commonDict } from "./common";
import { sidebarDict } from "./sidebar";
import { loginDict } from "./login";
import { homeDict } from "./home";
import { adminDict } from "./admin";
import { allGamesDict } from "./allGames";
import { buildDetailDict } from "./buildDetail";
import { gameDetailDict } from "./gameDetail";
import { gamesListDict } from "./gamesList";
import { mediaDict } from "./media";
import { newConceptDict } from "./newConcept";
import { newGameDict } from "./newGame";
import { unityPlayworksDict } from "./unityPlayworks";
import { variantEditorDict } from "./variantEditor";
import { newVariantDict } from "./newVariant";
import { playgroundConfigFormDict } from "./playgroundConfigForm";
import { eventLogDict } from "./eventLog";

/**
 * Đăng ký namespace ở đây — mỗi namespace là 1 file riêng (tránh nhiều người/nhiều lần sửa cùng đụng 1
 * file). Thêm namespace mới: tạo file `dictionaries/<name>.ts` (xem common.ts/login.ts cho pattern,
 * dùng `defineDict` ở ../types.ts), rồi import + thêm vào object bên dưới.
 */
export const translations = {
  common: commonDict,
  sidebar: sidebarDict,
  login: loginDict,
  home: homeDict,
  admin: adminDict,
  allGames: allGamesDict,
  buildDetail: buildDetailDict,
  gameDetail: gameDetailDict,
  gamesList: gamesListDict,
  media: mediaDict,
  newConcept: newConceptDict,
  newGame: newGameDict,
  unityPlayworks: unityPlayworksDict,
  variantEditor: variantEditorDict,
  newVariant: newVariantDict,
  playgroundConfigForm: playgroundConfigFormDict,
  eventLog: eventLogDict,
};

export type Namespace = keyof typeof translations;
