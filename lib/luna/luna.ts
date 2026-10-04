/**
 * Port từ playable-tool cũ (D:\playable-tool\src\components\utils\luna\luna.ts) — biến đổi HTML export
 * từ Cocos Luna sang script riêng của từng ad network bằng regex (không dùng DOM parser, xem
 * AGENTS.md/CLAUDE.md của repo cũ). Dùng cho app/unity-playworks (Luna -> Drive).
 */
import JSZip from "jszip";
import { SCRIPT_APPLOVIN, SCRIPT_FACEBOOK, SCRIPT_TIKTOK, TEXT_GOOGLE, TEXT_MINTEGRAL } from "@/constants/luna";

export const LUNA_ZIP_NETWORKS = ["mintegral", "google", "tiktok", "facebook"];

interface NameFileParams {
  network: string;
  idea: string;
  PA?: string;
  localize?: string;
  nameGame: string;
  nameUser: string;
}

const NETWORK_ABBR: Record<string, string> = {
  applovin: "ALV",
  facebook: "FB",
  google: "GG",
  mintegral: "MTG",
  tiktok: "TT",
  unity: "Uni",
  ironsource: "IS",
};

export function generateNameFile({ network, idea, PA, localize, nameGame, nameUser }: NameFileParams): string {
  const date = new Date();
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear().toString().slice(2);
  const dateUp = `${nameUser || "linhtv"}${d < 10 ? "0" + d : d}${m < 10 ? "0" + m : m}${y}`;
  const nameNetwork = NETWORK_ABBR[network] ?? network;
  return `${localize ? localize + "_" : ""}${nameGame}_inhouse_${nameNetwork}_${idea.replace(" ", "")}_${PA ? PA + "_" : ""}${dateUp}`;
}

/** Lấy tên PA từ tên file Luna (vd trong file .zip) — hiện chỉ trả nguyên tên, giữ đúng hành vi bản gốc. */
export function getPALuna(text: string): string {
  return text.split("_").join("_");
}

function removeNotch(htmlText: string): string {
  const regex = /#application-canvas\s*{[^}]*}/g;
  const nextStyleCanvas = `#application-canvas{margin:0 auto;display:block;background:#000;position:absolute;width:100%!important;height:100%!important;top: env(safe-area-inset-top);left:0;}`;
  return htmlText.replace(regex, nextStyleCanvas);
}

function removeConsole(htmlText: string): string {
  const scriptTags = htmlText.match(/<script[^>]*>[\s\S]*?<\/script>/g) ?? [];
  for (const tag of scriptTags) {
    if (tag.includes(`(()=>{let e=window.insertYourRemoteDebuggingTokenHere`)) {
      htmlText = htmlText.replace(tag, "");
    }
  }
  return htmlText.replace(`["debug","trace","info","log","warn","error"];`, `[];`);
}

function addFunctionScriptApplovin(htmlText: string): string {
  return htmlText.replace(/<\/script>(?![\s\S]*<\/script>)/, SCRIPT_APPLOVIN);
}

function addFunctionScriptFacebook(htmlText: string): string {
  const scriptTags = htmlText.match(/<script[^>]*>[\s\S]*?<\/script>/g) ?? [];
  const lastScriptTag = scriptTags.slice(-1);
  return htmlText.replace(lastScriptTag.join(""), SCRIPT_FACEBOOK);
}

function addFunctionScriptMintegral(htmlText: string): string {
  const scriptTags = htmlText.match(/<script[^>]*>[\s\S]*?<\/script>/g) ?? [];
  const lastTwoScriptTags = scriptTags.slice(-2);
  return htmlText.replace(lastTwoScriptTags.join(""), TEXT_MINTEGRAL.scriptText);
}

function addFunctionScriptGoogle(htmlText: string): string {
  const textFile = htmlText.replace(/<meta[^>]*>([\s\S]*?)<script>/, TEXT_GOOGLE.metaText);
  const scriptTags = textFile.match(/<script[^>]*>[\s\S]*?<\/script>/g) ?? [];
  const lastScriptTag = scriptTags.slice(-1);
  return textFile.replace(lastScriptTag.join(""), TEXT_GOOGLE.scriptText);
}

function addFunctionScriptTiktok(htmlText: string): string {
  const scriptTags = htmlText.match(/<script[^>]*>[\s\S]*?<\/script>/g) ?? [];
  const lastScriptTag = scriptTags.slice(-1);
  return htmlText.replace(lastScriptTag.join(""), SCRIPT_TIKTOK);
}

/** Áp script riêng của `network` vào nội dung HTML export Luna. Ném lỗi nếu file không phải export Luna (thiếu "unityads"). */
export function handleChangeFile(network: string, textFile: string): string {
  if (!textFile.includes("unityads")) {
    throw new Error("File không chứa unityads");
  }

  let newTextFile = textFile.replace(/(window\.pi\.apply\(window,).*?(\|\|(\[\]))/g, (_match, p1, p2) => p1 + "[]" + p2);
  newTextFile = removeNotch(newTextFile);
  if (network === "unity") return newTextFile;

  let text = removeConsole(newTextFile.replaceAll("unityads", network));
  switch (network) {
    case "applovin":
      return addFunctionScriptApplovin(text);
    case "mintegral":
      text = text.replace(/<meta[^>]*>([\s\S]*?)<script>/, TEXT_MINTEGRAL.metaText);
      return addFunctionScriptMintegral(text);
    case "google":
      return addFunctionScriptGoogle(text);
    case "facebook":
      return addFunctionScriptFacebook(text);
    case "ironsource":
      return text;
    case "tiktok":
      text = text.replace(
        /<\/script>/,
        `</script><script src = "https://sf16-muse-va.ibytedtos.com/obj/union-fe-nc-i18n/playable/sdk/playable-sdk.js"></script>`,
      );
      return addFunctionScriptTiktok(text);
    default:
      return text;
  }
}

function separateFileFB(data: string): { html: string; js: string } {
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
  let match: RegExpExecArray | null;
  let jsCode = "";
  while ((match = scriptRegex.exec(data)) !== null) {
    jsCode += match[1] + ";\n";
  }
  const cleanedHTML = data.replace(scriptRegex, "");
  return { html: cleanedHTML + `<script src="./index.js"></script>`, js: jsCode };
}

/** Đóng gói 1 HTML blob thành .zip theo yêu cầu riêng của từng network (facebook tách index.js, tiktok thêm config.json). */
export async function convertZipBlob(blob: Blob, network: string): Promise<Blob> {
  const zip = new JSZip();

  if (network === "facebook") {
    const textHtml = await blob.text();
    const { html, js } = separateFileFB(textHtml);
    zip.file("index.html", new Blob([html], { type: "text/html" }));
    zip.file("index.js", new Blob([js], { type: "text/javascript" }));
    return zip.generateAsync({ type: "blob" });
  }

  zip.file("index.html", blob);
  if (network === "tiktok") {
    const text = `{"playable_orientation":0,"playable_languages":["ja","zh","ar","es","en","ko","pt","ru","vi"]}`;
    zip.file("config.json", new Blob([text], { type: "application/json" }));
  }
  return zip.generateAsync({ type: "blob" });
}

interface LunaFileGroup {
  unity?: JSZip.JSZipObject;
  ironsource?: JSZip.JSZipObject;
}

/** Gom các file .html trong 1 zip Luna theo tên gốc (bỏ hậu tố _unityads/_ironsource), để xử lý từng cặp unity/ironsource. */
export async function groupFiles(zipFiles: JSZip): Promise<Record<string, LunaFileGroup>> {
  const fileGroups: Record<string, LunaFileGroup> = {};
  zipFiles.forEach((_relativePath, file) => {
    if (!file.name.includes(".html") && (!file.name.includes("unity") || !file.name.includes("ironsource"))) return;
    const isUnity = file.name.includes("unity");
    const key = file.name.replace(/_(unityads|ironsource)\.html$/, "");
    fileGroups[key] = { ...fileGroups[key], [isUnity ? "unity" : "ironsource"]: file };
  });
  return fileGroups;
}
