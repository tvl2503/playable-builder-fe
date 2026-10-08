interface IconProps {
  className?: string;
}

export function PlusIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export function MinusIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15" />
    </svg>
  );
}

export function PreviewIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function GamesIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 4.5l7.5 4.334v6.332l-7.5 4.334-7.5-4.334V8.834L11.25 4.5z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5v6.75l7.5-4.166M11.25 11.25l-7.5-4.166M11.25 11.25v8.25" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export function UploadCloudIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 15.75a4.5 4.5 0 004.5 4.5h9a4.5 4.5 0 00.5-8.97 6 6 0 00-11.43-3.155A4.502 4.502 0 003 15.75z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v6m0-6 2.25 2.25M12 12.75 9.75 15" />
    </svg>
  );
}

export function LayersIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 8.25 9.75-5.25 9.75 5.25-9.75 5.25-9.75-5.25z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12.75 9.75 5.25 9.75-5.25M2.25 8.25v4.5m19.5-4.5v4.5" />
    </svg>
  );
}

export function RocketIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.72m5.96 5.65a14.98 14.98 0 01-5.96-5.65m0 0a14.98 14.98 0 00-5.16 5.16m5.16-5.16L4.63 4.63"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75c-1.5 1.5-2 5.25-2 5.25s3.75-.5 5.25-2" />
    </svg>
  );
}

export function SparklesIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
      />
    </svg>
  );
}

export function ExternalLinkIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}

export function ShareIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 103.933 2.185 2.25 2.25 0 00-3.933-2.185zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
      />
    </svg>
  );
}

export function DuplicateIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-8.25A2.25 2.25 0 017.5 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6"
      />
    </svg>
  );
}

export function MoveIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h9m0 0L8.25 3.75M12 7.5l-3.75 3.75M21 16.5h-9m0 0 3.75-3.75M12 16.5l3.75 3.75" />
    </svg>
  );
}

export function EditIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  );
}

export function ShieldIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z"
      />
    </svg>
  );
}

export function TrashIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

export function ReloadIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

export function LogoutIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
      />
    </svg>
  );
}

export function AndroidIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="4 2 24 28" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5915 3.88444C13.6002 3.32107 14.7626 3 16 3C17.2374 3 18.3998 3.32107 19.4085 3.88444L20.1464 3.14645C20.3417 2.95118 20.6583 2.95118 20.8536 3.14645C21.0488 3.34171 21.0488 3.65829 20.8536 3.85355L20.2612 4.44595C21.9266 5.72558 23 7.73743 23 10H9C9 7.73743 10.0734 5.72558 11.7388 4.44595L11.1464 3.85355C10.9512 3.65829 10.9512 3.34171 11.1464 3.14645C11.3417 2.95118 11.6583 2.95118 11.8536 3.14645L12.5915 3.88444ZM14 7C14 7.55228 13.5523 8 13 8C12.4477 8 12 7.55228 12 7C12 6.44772 12.4477 6 13 6C13.5523 6 14 6.44772 14 7ZM19 8C19.5523 8 20 7.55228 20 7C20 6.44772 19.5523 6 19 6C18.4477 6 18 6.44772 18 7C18 7.55228 18.4477 8 19 8Z"
        fill="#87C527"
      />
      <path d="M5 12.5C5 11.6716 5.67157 11 6.5 11C7.32843 11 8 11.6716 8 12.5V18.5C8 19.3284 7.32843 20 6.5 20C5.67157 20 5 19.3284 5 18.5V12.5Z" fill="#87C527" />
      <path
        d="M12 24V27.5C12 28.3284 12.6716 29 13.5 29C14.3284 29 15 28.3284 15 27.5V24H17V27.5C17 28.3284 17.6716 29 18.5 29C19.3284 29 20 28.3284 20 27.5V24H21C22.1046 24 23 23.1046 23 22V11H9V22C9 23.1046 9.89543 24 11 24H12Z"
        fill="#87C527"
      />
      <path d="M24 12.5C24 11.6716 24.6716 11 25.5 11C26.3284 11 27 11.6716 27 12.5V18.5C27 19.3284 26.3284 20 25.5 20C24.6716 20 24 19.3284 24 18.5V12.5Z" fill="#87C527" />
    </svg>
  );
}

export function AppleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
    </svg>
  );
}

export function DriveIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="4 5 24 22" fill="none" aria-hidden="true">
      <path
        d="M16.0019 12.4507L12.541 6.34297C12.6559 6.22598 12.7881 6.14924 12.9203 6.09766C11.8998 6.43355 11.4315 7.57961 11.4315 7.57961L5.10895 18.7345C5.01999 19.0843 4.99528 19.4 5.0064 19.6781H11.9072L16.0019 12.4507Z"
        fill="#34A853"
      />
      <path
        d="M16.002 12.4507L20.0967 19.6781H26.9975C27.0086 19.4 26.9839 19.0843 26.8949 18.7345L20.5724 7.57961C20.5724 7.57961 20.1029 6.43355 19.0835 6.09766C19.2145 6.14924 19.3479 6.22598 19.4628 6.34297L16.002 12.4507Z"
        fill="#FBBC05"
      />
      <path
        d="M16.0019 12.4514L19.4628 6.34371C19.3479 6.22671 19.2144 6.14997 19.0835 6.09839C18.9327 6.04933 18.7709 6.01662 18.5954 6.00781H18.4125H13.5913H13.4084C13.2342 6.01536 13.0711 6.04807 12.9203 6.09839C12.7894 6.14997 12.6559 6.22671 12.541 6.34371L16.0019 12.4514Z"
        fill="#188038"
      />
      <path
        d="M11.9082 19.6782L8.48687 25.7168C8.48687 25.7168 8.3732 25.6614 8.21875 25.5469C8.70434 25.9206 9.17633 25.9998 9.17633 25.9998H22.6134C23.3547 25.9998 23.5092 25.7168 23.5092 25.7168C23.5116 25.7155 23.5129 25.7142 23.5153 25.713L20.0965 19.6782H11.9082Z"
        fill="#4285F4"
      />
      <path
        d="M11.9086 19.6782H5.00781C5.04241 20.4985 5.39826 20.9778 5.39826 20.9778L5.65773 21.4281C5.67627 21.4546 5.68739 21.4697 5.68739 21.4697L6.25205 22.461L7.51976 24.6676C7.55683 24.7569 7.60008 24.8386 7.6458 24.9166C7.66309 24.9431 7.67915 24.972 7.69769 24.9972C7.70263 25.0047 7.70757 25.0123 7.71252 25.0198C7.86944 25.2412 8.04489 25.4123 8.22034 25.5469C8.37479 25.6627 8.48847 25.7168 8.48847 25.7168L11.9086 19.6782Z"
        fill="#1967D2"
      />
      <path
        d="M20.0967 19.6782H26.9974C26.9628 20.4985 26.607 20.9778 26.607 20.9778L26.3475 21.4281C26.329 21.4546 26.3179 21.4697 26.3179 21.4697L25.7532 22.461L24.4855 24.6676C24.4484 24.7569 24.4052 24.8386 24.3595 24.9166C24.3422 24.9431 24.3261 24.972 24.3076 24.9972C24.3026 25.0047 24.2977 25.0123 24.2927 25.0198C24.1358 25.2412 23.9604 25.4123 23.7849 25.5469C23.6305 25.6627 23.5168 25.7168 23.5168 25.7168L20.0967 19.6782Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function SunIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-2.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      />
    </svg>
  );
}

export function MoonIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    </svg>
  );
}

export function UnityIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12.9288 4.2939 3.7997 2.1929c.1366.077.1415.2905 0 .3675l-4.515 2.6076a.4192.4192 0 0 1-.4246 0L7.274 6.8543c-.139-.0745-.1415-.293 0-.3675l3.7972-2.193V0L1.3758 5.5977V16.793l3.7177-2.1456v-4.3858c-.0025-.1565.1813-.2682.318-.1838l4.5148 2.6076a.4252.4252 0 0 1 .2136.3676v5.2127c.0025.1565-.1813.2682-.3179.1838l-3.7996-2.1929-3.7178 2.1457L12 24l9.6954-5.5977-3.7178-2.1457-3.7996 2.1929c-.1341.082-.3229-.0248-.3179-.1838V13.053c0-.1565.087-.2956.2136-.3676l4.5149-2.6076c.134-.082.3228.0224.3179.1838v4.3858l3.7177 2.1456V5.5977L12.9288 0Z" />
    </svg>
  );
}

export function GithubIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.7 1.25 3.36.95.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.97 0 1.95.13 2.87.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.21.66.8.55A10.53 10.53 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
    </svg>
  );
}

export function ImageIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75 8.69 9.3a2.25 2.25 0 013.182 0l5.368 5.368m-1.5-1.5 1.045-1.045a2.25 2.25 0 013.182 0l2.475 2.475M14.25 7.5h.008v.008h-.008V7.5zM3.75 19.5h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
      />
    </svg>
  );
}

export function MusicIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25V5.408a1.5 1.5 0 011.17-1.463l7.5-1.667A1.5 1.5 0 0119.5 3.75v11.5M9 17.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm10.5-2v2a2.25 2.25 0 11-4.5 0v-2a2.25 2.25 0 114.5 0z" />
    </svg>
  );
}

export function PlayIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8.25 4.5v15l12-7.5-12-7.5z" />
    </svg>
  );
}

export function PauseIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.75 5.25a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-2.25a.75.75 0 01-.75-.75V5.25z" />
    </svg>
  );
}

export function BookIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

export function CopyIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3a2.25 2.25 0 00-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    </svg>
  );
}

export function CheckIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export function FolderIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-19.5 0v6a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-6m-19.5 0A2.25 2.25 0 014.5 10.5h3.379a1.5 1.5 0 011.06.44l1.122 1.12a1.5 1.5 0 001.06.44h6.129A2.25 2.25 0 0119.5 12.75"
      />
    </svg>
  );
}

export function PackageIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-8.25-4.5L3.75 7.5m16.5 0l-8.25 4.5m8.25-4.5v9l-8.25 4.5m0-9L3.75 7.5m8.25 4.5v9m0-9L3.75 16.5V7.5"
      />
    </svg>
  );
}

export function AlertIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
