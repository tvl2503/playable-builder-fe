/**
 * Port từ playable-tool cũ (D:\playable-tool\src\components\constants\game.ts) — script injection
 * per-network cho file Luna export. Giữ nguyên nội dung, đừng "dọn dẹp" các script minified này vì
 * chúng khớp chính xác với hành vi SDK runtime của từng ad network.
 */

export const LOCALIZE_OPTIONS = [
  { value: "", label: "None" },
  { value: "EN", label: "English" },
  { value: "JP", label: "Janpanese" },
  { value: "DE", label: "German" },
  { value: "TW", label: "Taiwan" },
  { value: "KR", label: "Korean" },
  { value: "ES", label: "Spanish" },
  { value: "PT", label: "Portuguese" },
  { value: "FR", label: "French" },
  { value: "IT", label: "Italian" },
  { value: "RU", label: "Russian" },
  { value: "IN", label: "Hindi" },
  { value: "TC", label: "Traditional Chinese" },
  { value: "BR", label: "Brazilian Portuguese" },
];

/** Danh sách network upload lên Drive — KHÁC với api.listNetworks() (dùng cho export ở builds/[id], do backend xử lý riêng). */
export const LUNA_NETWORKS = ["applovin", "facebook", "google", "mintegral", "tiktok", "ironsource", "unity"];

const metaMintegral = `
<meta charset="utf-8"><meta name="viewport" content="width=device-width,user-scalable=no,initial-scale=1.0, minimum-scale=1.0,maximum-scale=1.0"/>
</head><body><script>
  function gameStart() {
      if (!window.app || !app.gameStart) {
        setTimeout(gameStart, 250);
        return;
      }
      app.gameStart();
    }

    function gameClose() {
      if (!app) return;
      app.gameClose();
    }

    function mobvistaGameReady() {
      window.gameReady && window.gameReady();
    }

    function mobvistaGameEnd() {
      window.gameEnd && window.gameEnd();
    }
`;
const scriptMintegral = `
  <script>
  (window.gameClose = function () {
    window.dispatchEvent(new Event("luna:pause"));
  }),
    window.addEventListener("luna:build", () => {
      Bridge.ready(() => {
        (Luna.Unity.Playable.InstallFullGame = function () {
          window.pi.logCta(), window.install && window.install();
        }),
          (Luna.Unity.LifeCycle.GameEnded = function () {
            window.pi.logGameEnd(), window.gameEnd && window.gameEnd();
          });
      });
    });
  </script>
  <script>
  window.addEventListener("luna:build", () => {
    window.pi.logLoaded(),
      window.dispatchEvent(new Event("luna:unsafe:pause")),
      window.dispatchEvent(new Event("luna:start"));
  }),
    window.addEventListener("luna:started", () => {
      window.gameReady && window.gameReady();
    }),
    (window.gameStart = function () {
      window.dispatchEvent(new Event("luna:unsafe:resume"));
    });</script>
`;

export const TEXT_MINTEGRAL = {
  metaText: metaMintegral,
  scriptText: scriptMintegral,
};

export const TEXT_GOOGLE = {
  metaText: `<meta charset="utf-8"><meta name="ad.orientation" content="portrait,landscape"></head><body><script>`,
  scriptText: `<script>window.addEventListener("luna:build",(function(){Bridge.ready((function(){Luna.Unity.Playable.InstallFullGame=function(){window.ExitApi.exit()}}))}))</script>`,
};

export const SCRIPT_APPLOVIN = `
</script><script>!function(){let e=window.innerWidth,n=window.innerHeight;window.addEventListener("resize",(()=>{e=window.innerWidth,n=window.innerHeight})),setInterval((()=>{e===window.innerWidth&&n===window.innerHeight||window.dispatchEvent(new Event("resize"))}),300)}(),window.addEventListener("luna:starting",(()=>{window.audioVolumeToggle(!0)})),window.addEventListener("luna:started",(()=>{const e=function(){document.body.removeEventListener("mousemove",e),document.body.removeEventListener("scroll",e),document.body.removeEventListener("keydown",e),document.body.removeEventListener("click",e),document.body.removeEventListener("touchstart",e),document.body.removeEventListener("pointerdown",e),window.dispatchEvent(new Event("luna:unsafe:unmute"))};document.body.addEventListener("mousemove",e),document.body.addEventListener("scroll",e),document.body.addEventListener("keydown",e),document.body.addEventListener("click",e),document.body.addEventListener("touchstart",e),document.body.addEventListener("pointerdown",e)}))</script>
`;

export const SCRIPT_FACEBOOK = `
<script>window.addEventListener("luna:build",(function(){Bridge.ready((function(){Luna.Unity.Playable.InstallFullGame=function(n,i){window.pi.logCta(),n=n||window.$environment.packageConfig.iosLink,i=i||window.$environment.packageConfig.androidLink;const o=/iphone|ipad|ipod|macintosh/i.test(window.navigator.userAgent.toLowerCase())?n:i;"undefined"!=typeof window.FbPlayableAd?window.FbPlayableAd.onCTAClick():mraid?mraid.open(o):(console.warn("Mraid is not defined"),window.open(o,"_blank"))}}))}))</script>
`;

export const SCRIPT_TIKTOK = `
<script>
window.addEventListener("luna:build", function () {
  Bridge.ready(function () {
    Luna.Unity.Playable.InstallFullGame = function (n, i) {
      window.pi.logCta(),
        (n = n || window.$environment.packageConfig.iosLink),
        (i = i || window.$environment.packageConfig.androidLink);
      const o = /iphone|ipad|ipod|macintosh/i.test(
        window.navigator.userAgent.toLowerCase()
      )
        ? n
        : i;
      window.playableSDK.openAppStore();
    };
  });
});
</script>
`;
