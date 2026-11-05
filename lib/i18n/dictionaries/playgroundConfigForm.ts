import { defineDict } from "../types";

export const playgroundConfigFormDict = defineDict(
  {
    noFields: "This build has no @playgroundField/@playgroundAsset to configure.",
    unsupportedAssetKind: "Unsupported ({{kind}})",
    change: "Change",
    choose: "Choose",
    clear: "Clear",
    arrayCount: "{{count}} items",
    addItem: "Add",
    removeItem: "Remove item",
    emptyArray: "Empty list",
  },
  {
    noFields: "Build này không có @playgroundField/@playgroundAsset nào để chỉnh.",
    unsupportedAssetKind: "Không hỗ trợ ({{kind}})",
    change: "Đổi",
    choose: "Chọn",
    clear: "Xoá",
    arrayCount: "{{count}} phần tử",
    addItem: "Thêm",
    removeItem: "Xoá phần tử",
    emptyArray: "Danh sách trống",
  },
);
