# Gobierno del repositorio – Permisos, protección y revisión

**Objetivo:** Configurar el gobierno del repositorio legalitas-crm: permisos, protección de ramas, CODEOWNERS y reglas de PR. Aplicable en **GitHub** o **Azure Repos**.

---

## 1. Resumen de objetivos

- **Nadie** hace push directo a `main` ni a `develop`.
- Todo cambio a `develop` entra por **Pull Request** con **al menos una aprobación** (revisores por ruta según CODEOWNERS).
- `main` solo recibe merge desde ramas `release/*` o `hotfix/*`.
- **Tech Lead por grupo funcional** (Finanzas, Operaciones) como revisores obligatorios en rutas críticas (plugins, BL/IBL, webresources).
- Opcional: que el **CI tenga que pasar** antes de poder hacer merge.

---

## 2. Permisos por rol (recomendación)

### 2.1 GitHub (Organization o cuenta)

| Rol / equipo | Permiso | Qué puede hacer |
|--------------|---------|------------------|
| **Admin (1–2 personas)** | Admin / Maintain | Gestionar repo, reglas de protección, CODEOWNERS, secrets, environments. |
| **Tech Lead Finanzas / Operaciones** | Write | Crear ramas, abrir PR, merge a develop/main **solo si las reglas lo permiten**. Revisar como Codeowner. |
| **Desarrolladores** | Write | Crear ramas, abrir PR; no merge directo a main/develop (bloqueado por protección). |
| **Lectura (stakeholders, QA)** | Read | Clonar, ver código, ver PR. |
| **Pipelines / bots** | Read + write (token o App) | Solo para CI/CD (checkout, publicar artefactos). |

En **GitHub Org** usar **Teams** (ej. `legalitas-crm-dev`, `legalitas-crm-tech-leads`) y asignar permisos por equipo.

### 2.2 Azure Repos

| Rol | Permiso | Notas |
|-----|---------|-------|
| **Project Admins** | Administrar políticas, aprobaciones. | Mínimo de personas. |
| **Contributors** | Push a ramas no protegidas; crear PR. | Resto del equipo. |
| **Readers** | Solo lectura. | Stakeholders. |
| **Build Service** | Contribuir (para CI/CD). | Cuenta de servicio del pipeline. |

---

## 3. Protección de ramas

### 3.1 Rama `develop`

Objetivo: **solo cambios vía PR aprobado**; no push directo.

**GitHub (Branch protection rules):**

- **Branch name pattern:** `develop`.
- **Require a pull request before merging** (Required approvals: 1 o 2).
- Opcional: **Dismiss stale pull request approvals when new commits are pushed**.
- **Require status checks to pass before merging** (ej. job de CI en GitHub Actions).
- Opcional: **Require branches to be up to date before merging**.
- **Do not allow bypassing the above settings** (o bypass solo a un rol muy restringido).
- No **force push** ni borrar la rama.

**Azure Repos:** Require minimum number of reviewers (1 o 2), Build validation (pipeline CI), restringir Bypass.

### 3.2 Rama `main`

Objetivo: **solo merge desde `release/*` o `hotfix/*`**; código en producción.

- **Require a pull request** (approvals: 1 o 2).
- **Require status checks** (CI).
- **Restrict who can push:** nadie (todo vía PR).
- **Allow force push:** nunca; **Allow deletion:** nunca.

---

## 4. CODEOWNERS (revisores por ruta)

- **Ubicación:** `.github/CODEOWNERS` (GitHub) o raíz del repo como `CODEOWNERS` (Azure Repos).
- **Contenido:** Ver [CODEOWNERS.md](CODEOWNERS.md). Rutas críticas (plugins, webresources, deploy) -> Tech Lead Finanzas/Operaciones; resto -> equipo por defecto.
- En GitHub, en la regla de `develop` (y `main`), activar **Require review from Code Owners** para que los CODEOWNERS sean obligatorios en las rutas que toquen.

---

## 5. Estrategia de merge

- **Merge a develop:** Preferir **Squash and merge** o **Rebase and merge**.
- **Merge a main:** Desde `release/X.Y.0` o `hotfix/X.Y.Z`; crear **tag** (ej. `v1.2.0`) en el commit de merge.
- Tras merge, borrar la rama feature/bug (opcional).

---

## 6. Opcionales

- **Environments (GitHub):** dev / pre / prod con approvers en **prod** (y opcionalmente pre) antes de que el CD despliegue.
- **Plantilla de PR** (`.github/PULL_REQUEST_TEMPLATE.md`) con checklist (tests, impacto BL/IBL).
- **Secrets:** Solo accesibles por Admins y por el pipeline; usar Environment secrets por entorno.
- **Concurrencia de despliegue:** mantener `concurrency` activo en workflows CD/Rollback para evitar solapes.

---

## 7. Checklist de implantación

- [ ] Permisos definidos por rol (Admin, Write, Read).
- [ ] Protección de `develop`: PR obligatorio, aprobaciones, status check CI, Code Owners requeridos, sin bypass.
- [ ] Protección de `main`: PR obligatorio, solo merge desde release/hotfix, sin force push.
- [ ] CODEOWNERS creado con Tech Lead en rutas críticas (ver [CODEOWNERS.md](CODEOWNERS.md)).
- [ ] [CONTRIBUTING.md](CONTRIBUTING.md) actualizado y comunicado al equipo.
- [ ] Checklist de salida revisado (ver [CHECKLIST_GO_LIVE_CI_CD.md](CHECKLIST_GO_LIVE_CI_CD.md)).

---

*Última actualización: Febrero 2026*
