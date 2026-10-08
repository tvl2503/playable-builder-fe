import { defineDict } from "../types";

export const docsDict = defineDict(
  {
    heading: "Integration & build guide",
    subheading:
      "From the engine project to a live playable: integrate the Playground script, build, zip, then run it through the system.",

    tocIntro: "Overview",
    tocIntegrate: "1. Integrate the script",
    tocBuild: "2. Build the project",
    tocZip: "3. Zip the build",
    tocSystem: "4. Steps in the system",
    tocReference: "Option reference",
    tocTroubleshooting: "Troubleshooting",

    introTitle: "Overview",
    introP1:
      "Playable Tool turns a normal Cocos Creator web-mobile build into a \"tunable\" playable: every field marked with @playgroundField/@playgroundAsset in your scripts becomes an editable value on the web UI, with instant live preview — no rebuild needed to try a new value.",
    introP2:
      "The flow has 4 parts: (1) drop the Playground scripts into your Cocos Creator project and decorate the fields you want tunable, (2) build the project to the Web Mobile platform as usual, (3) zip the build output, (4) upload that zip into the system to create variants, preview, and export per ad network.",

    integrateTitle: "1. Integrate the Playground script",
    integrateP1:
      "The project already has 3 ready-made files that implement the @playgroundField and @playgroundAsset decorators: playgroundRegistry.ts, playgroundField.ts, playgroundAsset.ts. Just copy them into your Cocos Creator project — no extra dependency, no engine-side setup required.",
    integrateStep1Title: "Copy the Lib folder into the project",
    integrateStep1Desc:
      "Copy the 3 files below into a Lib folder inside your scripts folder (e.g. assets/Scripts/Lib/). Keep the file names unchanged — other scripts import them by relative path.",
    integrateStep2Title: "Decorate a plain value field",
    integrateStep2Desc:
      "Add @playgroundField({ section: \"...\" }) right below the existing @property(...) on any boolean/number/string/color field you want tunable. section groups fields together on the editor UI — fields with the same section are shown in one group.",
    integrateStep3Title: "Decorate an asset field (image/audio)",
    integrateStep3Desc:
      "For SpriteFrame/Texture2D/AudioClip fields, use @playgroundAsset({ section: \"...\" }) instead of @playgroundField — the system automatically detects the asset kind (image/audio) from the property's Cocos type, no need to declare it by hand.",
    integrateNote:
      "Important: a field only becomes configurable if its component is actually attached to a Node in the launch scene. A script that exists in the build bundle but isn't placed on any Node in the scene is skipped — its onLoad()/start() never runs, so there is nothing meaningful to override.",

    buildTitle: "2. Build the project in Cocos Creator",
    buildP1:
      "In Cocos Creator, open Project → Build, choose the Web Mobile platform, keep the usual build settings for this project (orientation, resolution, ...), then press Build. No special flag is required for the Playground scripts — they work with a normal build.",
    buildP2:
      "When the build finishes, Cocos Creator creates a build/web-mobile folder (or another name you configured) containing index.html plus the project's resources/scripts.",

    zipTitle: "3. Zip the web-mobile folder",
    zipP1:
      "Open the build/web-mobile folder, select everything inside it (index.html, src/, assets/, ...), and compress them into a single .zip file — do not zip the parent folder itself.",
    zipWarning:
      "Common mistake: if you right-click the web-mobile folder and compress it directly, the zip will contain one extra wrapping folder and index.html won't be at the zip's root. Open the folder first, select all its contents, then zip — index.html must sit right at the top level of the zip.",

    systemTitle: "4. Steps in the Playable Tool system",
    systemP1: "Once you have the web-mobile zip, follow these steps on the web app to create a build and start tuning it:",
    systemStep1Title: "Sign in",
    systemStep1Desc: "Sign in with your Google account on the login page.",
    systemStep2Title: "Pick or create a game",
    systemStep2Desc: 'Open the "Creatives" page, choose an existing game, or create a new one if this is the first build for it.',
    systemStep3Title: "Create a new concept",
    systemStep3Desc:
      'On the game\'s page, press "+ Concept", name the concept, optionally pick an image compression mode, then upload the zip file you just created.',
    systemStep4Title: "Wait for the build to finish",
    systemStep4Desc:
      "The system unpacks the zip, scans for @playgroundField/@playgroundAsset, and prepares the preview build. The page updates automatically once it's done — no need to refresh.",
    systemStep5Title: "Create variants",
    systemStep5Desc:
      'Open the concept and press "+ Variant" to create a named config set. Each variant can hold a different set of values without rebuilding the project.',
    systemStep6Title: "Edit values & live preview",
    systemStep6Desc:
      "In the variant editor, adjust each field (checkbox, number, slider, color, or pick an image/audio from the Media library for asset fields) and see the change instantly in the preview panel.",
    systemStep7Title: "Share a preview link",
    systemStep7Desc: 'Use "Share" to generate a public link (no login required) so others can view this exact variant or the original build.',
    systemStep8Title: "Export per ad network",
    systemStep8Desc:
      'When a variant is ready, press "Export" on the concept page, pick one or more ad networks and one or more variants, then download the correctly-named file/zip for each network.',
    systemNote:
      'Before exporting, make sure the game has a shortName (and inhouse/publish flag) filled in on the "All Games" page — export is blocked with an error otherwise, since the exported file name is built from it.',

    referenceTitle: "@playgroundField / @playgroundAsset option reference",
    referenceP1: "Options are passed as an object argument to the decorator, e.g. @playgroundField({ section: \"Timer\", type: \"integer\" }).",
    refColOption: "Option",
    refColAppliesTo: "Applies to",
    refColDesc: "Description",
    refSectionDesc: "Group label shown on the editor UI. Fields sharing the same section are grouped together.",
    refTypeDesc:
      "boolean | integer | float | number | string | color. If omitted, the type is inferred from the field's default value (number → integer/float, Color literal → color, ...).",
    refSliderDesc: "Render a slider instead of a plain number input. Only meaningful together with min/max.",
    refMinMaxDesc: "Slider/number bounds. Falls back to the engine's @property({ range }) if already declared there.",
    refStepDesc: "Step size for the slider/number input.",
    refAssetAuto: "Automatically detected",
    refAssetAutoDesc:
      "@playgroundAsset doesn't need a type option — the system reads the property's Cocos type (SpriteFrame/Texture2D → image, AudioClip → audio) by itself.",

    troubleshootingTitle: "Troubleshooting",
    troubleItem1Title: "A field/asset doesn't show up in the config list",
    troubleItem1Desc:
      "Check that the component holding that field is actually attached to a Node in the scene that launches first (the launch scene). A script that's only imported but never placed on a Node is filtered out.",
    troubleItem2Title: 'Export is blocked with a "missing shortName" error',
    troubleItem2Desc: 'Open "All Games", find the game, and fill in shortName and the inhouse/publish flag, then export again.',
    troubleItem3Title: "Can't change an image/audio asset field in the variant editor",
    troubleItem3Desc: 'Upload the file to the "Media" library first (per game or shared across games), then pick it from there in the field.',
    troubleItem4Title: "Uploaded asset fails or is rejected",
    troubleItem4Desc: "Each media file is capped at 15MB — compress the image/audio before uploading if it's larger than that.",
  },
  {
    heading: "Hướng dẫn tích hợp & build",
    subheading: "Từ project bên engine tới playable chạy thật: tích hợp script Playground, build, nén zip, rồi đưa lên hệ thống.",

    tocIntro: "Tổng quan",
    tocIntegrate: "1. Tích hợp script",
    tocBuild: "2. Build project",
    tocZip: "3. Nén file zip",
    tocSystem: "4. Các bước trên hệ thống",
    tocReference: "Bảng tham chiếu option",
    tocTroubleshooting: "Xử lý sự cố",

    introTitle: "Tổng quan",
    introP1:
      "Playable Tool biến 1 bản build web-mobile bình thường của Cocos Creator thành playable \"chỉnh được\": mọi field được đánh dấu @playgroundField/@playgroundAsset trong script sẽ trở thành giá trị chỉnh được trên web, xem thay đổi ngay lập tức mà không cần build lại.",
    introP2:
      "Quy trình gồm 4 phần: (1) copy script Playground vào project Cocos Creator và đánh dấu các field muốn chỉnh được, (2) build project ra platform Web Mobile như bình thường, (3) nén thư mục build thành file zip, (4) upload file zip đó lên hệ thống để tạo biến thể, xem preview và export theo từng ad network.",

    integrateTitle: "1. Tích hợp script Playground",
    integrateP1:
      "Project đã có sẵn 3 file hiện thực decorator @playgroundField và @playgroundAsset: playgroundRegistry.ts, playgroundField.ts, playgroundAsset.ts. Chỉ cần copy vào project Cocos Creator — không cần cài thêm thư viện hay cấu hình gì phía engine.",
    integrateStep1Title: "Copy thư mục Lib vào project",
    integrateStep1Desc:
      "Copy 3 file bên dưới vào 1 thư mục Lib trong thư mục script (vd: assets/Scripts/Lib/). Giữ nguyên tên file — các script khác import chúng bằng đường dẫn tương đối.",
    integrateStep2Title: "Đánh dấu field giá trị thường",
    integrateStep2Desc:
      "Thêm @playgroundField({ section: \"...\" }) ngay dưới @property(...) có sẵn ở field boolean/number/string/color muốn cho chỉnh. section dùng để nhóm các field lại với nhau trên giao diện chỉnh biến thể — field cùng section sẽ hiện chung 1 nhóm.",
    integrateStep3Title: "Đánh dấu field asset (ảnh/audio)",
    integrateStep3Desc:
      "Với field kiểu SpriteFrame/Texture2D/AudioClip, dùng @playgroundAsset({ section: \"...\" }) thay vì @playgroundField — hệ thống tự nhận diện loại asset (ảnh/audio) từ kiểu Cocos của property, không cần khai tay.",
    integrateNote:
      "Lưu ý quan trọng: field chỉ cho chỉnh được nếu component chứa nó thật sự được gắn lên 1 Node trong scene khởi động (launch scene). Script tồn tại trong bundle nhưng không gắn lên node nào trong scene sẽ bị bỏ qua — onLoad()/start() của nó không bao giờ chạy nên không có ý nghĩa gì để override.",

    buildTitle: "2. Build project trong Cocos Creator",
    buildP1:
      "Trong Cocos Creator, mở Project → Build, chọn platform Web Mobile, giữ nguyên các cấu hình build vốn có của project (orientation, độ phân giải, ...), rồi bấm Build. Không cần bật/tắt option đặc biệt nào cho script Playground — build bình thường là đủ.",
    buildP2:
      "Khi build xong, Cocos Creator tạo ra thư mục build/web-mobile (hoặc tên khác nếu bạn đặt riêng) chứa index.html cùng resource/script của project.",

    zipTitle: "3. Nén thư mục web-mobile thành zip",
    zipP1:
      "Mở thư mục build/web-mobile, chọn toàn bộ nội dung bên trong (index.html, src/, assets/, ...) rồi nén thành 1 file .zip duy nhất — không nén cả thư mục cha.",
    zipWarning:
      "Lỗi thường gặp: nếu bấm chuột phải ngay trên thư mục web-mobile rồi nén, file zip sẽ có thêm 1 cấp thư mục bọc ngoài và index.html không nằm ở gốc zip. Phải mở thư mục ra, chọn hết nội dung bên trong rồi mới nén — index.html phải nằm đúng ở cấp cao nhất của file zip.",

    systemTitle: "4. Các bước trên hệ thống Playable Tool",
    systemP1: "Có file zip web-mobile rồi, làm theo các bước sau trên web để tạo bản build và bắt đầu chỉnh:",
    systemStep1Title: "Đăng nhập",
    systemStep1Desc: "Đăng nhập bằng tài khoản Google ở trang login.",
    systemStep2Title: "Chọn hoặc tạo game",
    systemStep2Desc: 'Vào trang "Creatives", chọn game đã có sẵn, hoặc tạo game mới nếu đây là bản build đầu tiên của game đó.',
    systemStep3Title: "Tạo concept mới",
    systemStep3Desc: 'Trong trang game, bấm "+ Concept", đặt tên concept, tuỳ chọn mức nén ảnh nếu cần, rồi upload file zip vừa tạo.',
    systemStep4Title: "Đợi build xử lý xong",
    systemStep4Desc:
      "Hệ thống tự giải nén, quét @playgroundField/@playgroundAsset và chuẩn bị bản build để preview. Trang tự cập nhật khi xong, không cần tự reload.",
    systemStep5Title: "Tạo biến thể",
    systemStep5Desc:
      'Mở concept rồi bấm "+ Variant" để tạo 1 bộ config có tên riêng. Mỗi biến thể giữ 1 bộ giá trị khác nhau mà không cần build lại project.',
    systemStep6Title: "Chỉnh giá trị & xem preview trực tiếp",
    systemStep6Desc:
      "Trong trang chỉnh biến thể, đổi từng field (checkbox, số, slider, color, hoặc chọn ảnh/audio từ kho Media với field asset) và xem thay đổi ngay trên khung preview.",
    systemStep7Title: "Chia sẻ link xem thử",
    systemStep7Desc: 'Dùng nút "Share" để tạo link công khai (không cần đăng nhập) cho người khác xem đúng biến thể này hoặc bản gốc.',
    systemStep8Title: "Export theo ad network",
    systemStep8Desc:
      'Khi biến thể đã ưng ý, bấm "Export" ở trang concept, chọn 1 hoặc nhiều ad network cùng 1 hoặc nhiều biến thể, rồi tải file/zip đã được đặt tên đúng chuẩn cho từng network.',
    systemNote:
      'Trước khi export, nhớ điền shortName (và cờ inhouse/publish) cho game ở trang "All Games" — thiếu sẽ bị chặn export kèm lỗi, vì tên file export được ráp từ đó.',

    referenceTitle: "Bảng tham chiếu option của @playgroundField / @playgroundAsset",
    referenceP1: "Option truyền vào decorator dưới dạng object, vd @playgroundField({ section: \"Timer\", type: \"integer\" }).",
    refColOption: "Option",
    refColAppliesTo: "Áp dụng cho",
    refColDesc: "Ý nghĩa",
    refSectionDesc: "Tên nhóm hiện trên giao diện chỉnh biến thể. Field cùng section được gom chung 1 nhóm.",
    refTypeDesc:
      "boolean | integer | float | number | string | color. Nếu không khai, type được tự đoán từ giá trị default của field (số → integer/float, literal Color → color, ...).",
    refSliderDesc: "Vẽ thanh trượt thay vì ô nhập số thường. Chỉ có ý nghĩa khi đi kèm min/max.",
    refMinMaxDesc: "Giới hạn của slider/ô số. Tự fallback về @property({ range }) phía engine nếu đã khai sẵn ở đó.",
    refStepDesc: "Bước nhảy của slider/ô số.",
    refAssetAuto: "Tự nhận diện",
    refAssetAutoDesc:
      "@playgroundAsset không cần khai type — hệ thống tự đọc kiểu Cocos của property (SpriteFrame/Texture2D → ảnh, AudioClip → audio).",

    troubleshootingTitle: "Xử lý sự cố",
    troubleItem1Title: "Field/asset không xuất hiện trong danh sách config",
    troubleItem1Desc:
      "Kiểm tra component chứa field đó có thật sự được gắn lên 1 Node trong scene khởi động (launch scene) hay chưa. Script chỉ import nhưng chưa gắn lên node nào sẽ bị lọc bỏ.",
    troubleItem2Title: 'Export bị chặn với lỗi "missing shortName"',
    troubleItem2Desc: 'Vào "All Games", tìm game, điền shortName và cờ inhouse/publish, rồi export lại.',
    troubleItem3Title: "Không đổi được field asset (ảnh/audio) trong trang chỉnh biến thể",
    troubleItem3Desc: 'Upload file đó vào kho "Media" trước (theo game hoặc dùng chung nhiều game), rồi chọn lại từ đó cho field.',
    troubleItem4Title: "Upload asset bị lỗi hoặc bị từ chối",
    troubleItem4Desc: "Mỗi file media giới hạn 15MB — nén nhỏ ảnh/audio lại trước khi upload nếu đang lớn hơn mức này.",
  },
);
