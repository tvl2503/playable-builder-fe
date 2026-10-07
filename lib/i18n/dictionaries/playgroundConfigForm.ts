import { defineDict } from "../types";

export const playgroundConfigFormDict = defineDict(
  {
    noFields: "This build has no @playgroundField/@playgroundAsset to configure.",
    unsupportedAssetKind: "Unsupported ({{kind}})",
    change: "Change",
    choose: "Choose",
    clear: "Clear",
  },
  {
    noFields: "Build này không có @playgroundField/@playgroundAsset nào để chỉnh.",
    unsupportedAssetKind: "Không hỗ trợ ({{kind}})",
    change: "Đổi",
    choose: "Chọn",
    clear: "Xoá",
  },
);
