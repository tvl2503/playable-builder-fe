"use client";

import { Card, CodeBlock } from "@/components/common";
import {
  AlertIcon,
  BookIcon,
  FolderIcon,
  PackageIcon,
  RocketIcon,
  SparklesIcon,
} from "@/components/icons";
import { useT } from "@/lib/i18n/useT";
import { routes } from "@/lib/routes";

const REGISTRY_CODE = `// playgroundRegistry.ts
export interface PlaygroundOptions {
  section?: string;
  displayName?: string;
  order?: number;
}

export type PlaygroundRegistry<T extends PlaygroundOptions> = Record<
  string,
  Record<string, T>
>;

// Shared factory: creates an isolated {className -> {propertyKey -> options}}
// registry plus the property decorator that fills it in.
export function createPlaygroundRegistry<T extends PlaygroundOptions>() {
  const registry: PlaygroundRegistry<T> = {};
  function decorate(options: T) {
    return function (target: any, propertyKey: string) {
      const className = target.constructor.name;
      (registry[className] ??= {})[propertyKey] = options;
    };
  }
  return { registry, decorate };
}
`;

const FIELD_CODE = `// playgroundField.ts
import { createPlaygroundRegistry, PlaygroundOptions } from "./playgroundRegistry";

export interface PlaygroundFieldOptions extends PlaygroundOptions {}

const { registry, decorate } = createPlaygroundRegistry<PlaygroundFieldOptions>();

export const PlaygroundFieldRegistry = registry;
export function playgroundField(options: PlaygroundFieldOptions = {}) {
  return decorate(options);
}
`;

const ASSET_CODE = `// playgroundAsset.ts
import { createPlaygroundRegistry, PlaygroundOptions } from "./playgroundRegistry";

export type PlaygroundAssetType = "image" | "audio";

export interface PlaygroundAssetOptions extends PlaygroundOptions {
  assetType?: PlaygroundAssetType;
}

const { registry, decorate } = createPlaygroundRegistry<PlaygroundAssetOptions>();

export const PlaygroundAssetRegistry = registry;
export function playgroundAsset(options: PlaygroundAssetOptions = {}) {
  return decorate(options);
}
`;

const USAGE_CODE = `import { _decorator, Component, CCBoolean, CCFloat, CCInteger, CCString, Color, SpriteFrame } from "cc";
import { playgroundField } from "./Lib/playgroundField";
import { playgroundAsset } from "./Lib/playgroundAsset";
const { ccclass, property } = _decorator;

@ccclass("GameSettings")
export class GameSettings extends Component {
  @property(CCBoolean)
  @playgroundField({ section: "Timer" })
  public showTimer: boolean = true;

  @property({ type: CCInteger, slide: true, min: 0, max: 100 })
  @playgroundField({ section: "Timer", type: "integer" })
  public timeLimit: number = 30;

  @property(CCString)
  @playgroundField({ section: "Text" })
  public ctaText: string = "Play now";

  @property(Color)
  @playgroundField({ section: "Theme" })
  public primaryColor: Color = new Color(255, 180, 0, 255);

  // Asset field: ảnh/audio - hệ thống tự nhận assetKind từ kiểu Cocos
  @property(SpriteFrame)
  @playgroundAsset({ section: "Background" })
  public backgroundImage: SpriteFrame = null;
}
`;

function Section({ id, icon: Icon, title, children }: { id: string; icon: typeof BookIcon; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <Card padding="lg" className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
        </div>
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-zinc-600 [&>p]:max-w-3xl dark:text-zinc-400">{children}</div>
      </Card>
    </section>
  );
}

function Step({ index, title, desc }: { index: number; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        {index}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-zinc-800 dark:text-zinc-100">{title}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{desc}</p>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const t = useT("docs");

  const TOC = [
    { href: "#intro", label: t("tocIntro") },
    { href: "#integrate", label: t("tocIntegrate") },
    { href: "#build", label: t("tocBuild") },
    { href: "#zip", label: t("tocZip") },
    { href: "#system", label: t("tocSystem") },
    { href: "#reference", label: t("tocReference") },
    { href: "#troubleshooting", label: t("tocTroubleshooting") },
  ];

  return (
    <main className="w-full flex-1 px-6 py-10 sm:px-10">
      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr]">
        {/* Hero + TOC */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg shadow-orange-900/25">
              <BookIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("heading")}</h1>
              <p className="mt-0.5 max-w-2xl text-sm text-zinc-500">{t("subheading")}</p>
            </div>
          </div>
        </div>

        <nav className="hidden flex-col gap-1 self-start lg:sticky lg:top-10 lg:flex">
          {TOC.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-6">
          <Section id="intro" icon={SparklesIcon} title={t("introTitle")}>
            <p>{t("introP1")}</p>
            <p>{t("introP2")}</p>
          </Section>

          <Section id="integrate" icon={FolderIcon} title={t("integrateTitle")}>
            <p>{t("integrateP1")}</p>

            <div className="flex flex-col gap-2">
              <p className="font-medium text-zinc-800 dark:text-zinc-100">{t("integrateStep1Title")}</p>
              <p className="text-xs">{t("integrateStep1Desc")}</p>
              <code className="w-fit rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                assets/Scripts/Lib/playgroundRegistry.ts, playgroundField.ts, playgroundAsset.ts
              </code>
              <div className="grid gap-3 lg:grid-cols-3">
                <CodeBlock filename="playgroundRegistry.ts" code={REGISTRY_CODE} />
                <CodeBlock filename="playgroundField.ts" code={FIELD_CODE} />
                <CodeBlock filename="playgroundAsset.ts" code={ASSET_CODE} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-medium text-zinc-800 dark:text-zinc-100">{t("integrateStep2Title")}</p>
              <p className="text-xs">{t("integrateStep2Desc")}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium text-zinc-800 dark:text-zinc-100">{t("integrateStep3Title")}</p>
              <p className="text-xs">{t("integrateStep3Desc")}</p>
            </div>
            <CodeBlock filename="GameSettings.ts" code={USAGE_CODE} />

            <div className="flex gap-2.5 rounded-xl bg-amber-50 p-3.5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertIcon className="h-4.5 w-4.5 shrink-0" />
              <p className="text-xs leading-relaxed">{t("integrateNote")}</p>
            </div>
          </Section>

          <Section id="build" icon={RocketIcon} title={t("buildTitle")}>
            <p>{t("buildP1")}</p>
            <p>{t("buildP2")}</p>
          </Section>

          <Section id="zip" icon={PackageIcon} title={t("zipTitle")}>
            <p>{t("zipP1")}</p>
            <div className="flex gap-2.5 rounded-xl bg-amber-50 p-3.5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertIcon className="h-4.5 w-4.5 shrink-0" />
              <p className="text-xs leading-relaxed">{t("zipWarning")}</p>
            </div>
          </Section>

          <Section id="system" icon={BookIcon} title={t("systemTitle")}>
            <p>{t("systemP1")}</p>
            <div className="flex flex-col gap-4">
              <Step index={1} title={t("systemStep1Title")} desc={t("systemStep1Desc")} />
              <Step index={2} title={t("systemStep2Title")} desc={t("systemStep2Desc")} />
              <Step index={3} title={t("systemStep3Title")} desc={t("systemStep3Desc")} />
              <Step index={4} title={t("systemStep4Title")} desc={t("systemStep4Desc")} />
              <Step index={5} title={t("systemStep5Title")} desc={t("systemStep5Desc")} />
              <Step index={6} title={t("systemStep6Title")} desc={t("systemStep6Desc")} />
              <Step index={7} title={t("systemStep7Title")} desc={t("systemStep7Desc")} />
              <Step index={8} title={t("systemStep8Title")} desc={t("systemStep8Desc")} />
            </div>
            <div className="flex gap-2.5 rounded-xl bg-amber-50 p-3.5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertIcon className="h-4.5 w-4.5 shrink-0" />
              <p className="text-xs leading-relaxed">
                {t("systemNote")}{" "}
                <a href={routes.allGames} className="font-medium underline underline-offset-2">
                  {routes.allGames}
                </a>
              </p>
            </div>
          </Section>

          <Section id="reference" icon={BookIcon} title={t("referenceTitle")}>
            <p>{t("referenceP1")}</p>
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900/60">
                  <tr>
                    <th className="px-3 py-2 font-medium">{t("refColOption")}</th>
                    <th className="px-3 py-2 font-medium">{t("refColAppliesTo")}</th>
                    <th className="px-3 py-2 font-medium">{t("refColDesc")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  <tr>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-primary">section</td>
                    <td className="px-3 py-2.5 text-zinc-500">field + asset</td>
                    <td className="px-3 py-2.5">{t("refSectionDesc")}</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-primary">type</td>
                    <td className="px-3 py-2.5 text-zinc-500">field</td>
                    <td className="px-3 py-2.5">{t("refTypeDesc")}</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-primary">slider</td>
                    <td className="px-3 py-2.5 text-zinc-500">field (number)</td>
                    <td className="px-3 py-2.5">{t("refSliderDesc")}</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-primary">min / max</td>
                    <td className="px-3 py-2.5 text-zinc-500">field (number)</td>
                    <td className="px-3 py-2.5">{t("refMinMaxDesc")}</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-primary">step</td>
                    <td className="px-3 py-2.5 text-zinc-500">field (number)</td>
                    <td className="px-3 py-2.5">{t("refStepDesc")}</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-primary">{t("refAssetAuto")}</td>
                    <td className="px-3 py-2.5 text-zinc-500">asset</td>
                    <td className="px-3 py-2.5">{t("refAssetAutoDesc")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="troubleshooting" icon={AlertIcon} title={t("troubleshootingTitle")}>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-medium text-zinc-800 dark:text-zinc-100">{t("troubleItem1Title")}</p>
                <p className="mt-0.5 text-xs">{t("troubleItem1Desc")}</p>
              </div>
              <div>
                <p className="font-medium text-zinc-800 dark:text-zinc-100">{t("troubleItem2Title")}</p>
                <p className="mt-0.5 text-xs">{t("troubleItem2Desc")}</p>
              </div>
              <div>
                <p className="font-medium text-zinc-800 dark:text-zinc-100">{t("troubleItem3Title")}</p>
                <p className="mt-0.5 text-xs">{t("troubleItem3Desc")}</p>
              </div>
              <div>
                <p className="font-medium text-zinc-800 dark:text-zinc-100">{t("troubleItem4Title")}</p>
                <p className="mt-0.5 text-xs">{t("troubleItem4Desc")}</p>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
