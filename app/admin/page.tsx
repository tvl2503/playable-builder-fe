"use client";

import { Button, Checkbox, Select } from "@/components/common";
import { PageLoading, Spinner } from "@/components/Spinner";
import type { Role } from "@/lib/api";
import { useT } from "@/lib/i18n/useT";
import { useAdminPage } from "./useAdminPage";

const ALL_ROLES: Role[] = ["ADMIN", "DEVELOP", "UA", "VIEWER"];

export default function AdminPage() {
  const t = useT("admin");
  const ROLE_LABEL: Record<string, string> = {
    ADMIN: t("roleAdmin"),
    DEVELOP: t("roleDevelop"),
    UA: t("roleUa"),
    VIEWER: t("roleViewer"),
  };
  const {
    session,
    isAdmin,
    users,
    usersError,
    savingUserId,
    updateUserRole,
    defs,
    editableRoles,
    matrix,
    matrixLoaded,
    matrixError,
    togglePermission,
    savingMatrix,
    savedMatrix,
    saveMatrix,
  } = useAdminPage();

  if (!session) return <PageLoading />;

  if (!isAdmin) {
    return (
      <main className="flex w-full flex-1 flex-col gap-6 px-8 py-10">
        <p className="text-sm text-zinc-500">{t("adminOnly")}</p>
      </main>
    );
  }

  const groups = [...new Set(defs.map((d) => d.group))];

  return (
    <main className="flex w-full flex-1 flex-col gap-6 px-8 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("heading")}</h1>
        <p className="mt-1 text-xs text-zinc-500">{t("subheading")}</p>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("usersSection")}</h2>
          {usersError && <p className="text-sm text-red-600 dark:text-red-400">{usersError}</p>}
          {!users && !usersError && (
            <div className="flex justify-center py-10">
              <Spinner className="h-6 w-6" />
            </div>
          )}
          {users && (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-4 border-b border-zinc-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                <span>{t("colName")}</span>
                <span>{t("colEmail")}</span>
                <span>{t("colRole")}</span>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {users.map((u) => (
                  <div key={u.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 px-4 py-3 text-sm">
                    <span className="truncate font-medium text-zinc-900 dark:text-zinc-50">{u.name}</span>
                    <span className="truncate text-xs text-zinc-500">{u.email}</span>
                    <Select
                      value={u.role}
                      disabled={savingUserId === u.id || u.id === session.user.id}
                      onChange={(e) => updateUserRole(u.id, e.target.value as Role)}
                      title={u.id === session.user.id ? t("cannotChangeOwnRole") : undefined}
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("permissionsSection")}</h2>
              <p className="mt-0.5 text-xs text-zinc-500">{t("permissionsNote")}</p>
            </div>
            <div className="flex items-center gap-2">
              {savedMatrix && <span className="text-xs text-green-600 dark:text-green-400">{t("saved")}</span>}
              <Button size="sm" onClick={saveMatrix} loading={savingMatrix} disabled={!matrixLoaded}>
                {t("save")}
              </Button>
            </div>
          </div>
          {matrixError && <p className="text-sm text-red-600 dark:text-red-400">{matrixError}</p>}

          {!matrixLoaded && !matrixError && (
            <div className="flex justify-center py-10">
              <Spinner className="h-6 w-6" />
            </div>
          )}

          {matrixLoaded && (
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900">
              <div
                className="grid items-center gap-4 border-b border-zinc-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-zinc-800"
                style={{ gridTemplateColumns: `1fr repeat(${editableRoles.length}, 80px)` }}
              >
                <span>{t("permissionColumn")}</span>
                {editableRoles.map((role) => (
                  <span key={role} className="text-center">
                    {ROLE_LABEL[role]}
                  </span>
                ))}
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {groups.map((group) => (
                  <div key={group}>
                    <div className="bg-zinc-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:bg-zinc-800/50">
                      {group}
                    </div>
                    {defs
                      .filter((d) => d.group === group)
                      .map((def) => (
                        <div
                          key={def.key}
                          className="grid items-center gap-4 px-4 py-2.5 text-sm"
                          style={{ gridTemplateColumns: `1fr repeat(${editableRoles.length}, 80px)` }}
                        >
                          <span className="text-zinc-700 dark:text-zinc-300">{def.label}</span>
                          {editableRoles.map((role) => (
                            <span key={role} className="flex justify-center">
                              <Checkbox
                                checked={(matrix[role] ?? []).includes(def.key)}
                                onChange={() => togglePermission(role, def.key)}
                              />
                            </span>
                          ))}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
