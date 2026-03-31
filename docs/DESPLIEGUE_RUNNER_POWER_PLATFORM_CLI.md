# Despliegue con Power Platform CLI alineado al CI/CD actual

Guia para automatizar el despliegue de componentes Dynamics 365/Dataverse usando `pac` (Power Platform CLI), adaptada a los workflows reales del repositorio `legalitas-crm`.

Este enfoque aplica a:

- Plugins C#
- Custom APIs
- Workflows / Actions
- Soluciones (managed/unmanaged)

---

## 1) Principio clave: que se despliega en Dynamics

En Dynamics 365 no se "publica una Web API" como un servicio web tradicional.

En realidad se despliega una **solucion** que contiene artefactos de plataforma:

- ensamblados de plugin y pasos de registro,
- Custom APIs,
- procesos/workflows/actions,
- metadatos y componentes asociados.

Por eso la estrategia correcta en entornos profesionales es:

1. empaquetar correctamente en soluciones,
2. importar soluciones por pipeline,
3. publicar personalizaciones,
4. validar y promover entre entornos.

---

## 2) Tooling oficial recomendado

Para despliegue en runner:

- **Power Platform CLI (`pac`)** - recomendado por flexibilidad.
- Alternativa: **Microsoft Power Platform Build Tools**.

Esta guia se centra en `pac` porque funciona bien en:

- GitHub Actions
- GitLab CI
- Jenkins
- cualquier runner Windows/Linux con conectividad y autenticacion valida.

---

## 3) Encaje exacto en el CI/CD actual

Workflows actuales del repo:

1. `/.github/workflows/ci.yml`
   - Trigger: `push` y `pull_request` sobre `develop`.
   - Ejecuta validacion de docs, build/test y publica artefacto `drop`.
2. `/.github/workflows/cd.yml`
   - Trigger: `workflow_run` de CI exitoso en `develop`, o `workflow_dispatch`.
   - Promocion secuencial: `deploy-dev -> deploy-pre -> check-day-25 -> deploy-pro`.
   - En ejecucion manual exige `run_id`.
3. `/.github/workflows/rollback.yml`
   - Trigger: manual.
   - Inputs obligatorios: `target_environment` y `run_id`.

Donde entra `pac`:

- En la accion compuesta `/.github/actions/deploy-dynamics/action.yml`, dentro de la fase de despliegue de soluciones/WFA.
- Implementacion recomendada: integrar comandos `pac` en `deploy/deploy-solutions.ps1` (y en `deploy/deploy-wfa.ps1` si procede).

---

## 4) Requisitos previos en runner

### 4.1 Dependencias

- PowerShell 7 (recomendado)
- .NET SDK (segun build)
- Power Platform CLI instalado y accesible en PATH

Verificacion:

```powershell
pac --version
```

### 4.2 Conectividad

El runner debe poder alcanzar:

- endpoint Dataverse del entorno (`https://<org>.crm?.dynamics.com`)
- endpoints de autenticacion de Microsoft Entra ID
- GitHub/artifact store (si corresponde)

### 4.3 Identidad de despliegue

Usar **Service Principal** (no usuario personal), con permisos minimos necesarios en cada entorno.

---

## 5) Variables y secretos alineados al proyecto

Definir por `Environment` de GitHub (`dev`, `pre`, `prod`):

- `PP_TENANT_ID`
- `PP_CLIENT_ID`
- `PP_CLIENT_SECRET`
- `PP_ENV_URL` (URL Dataverse)
- `SOLUTION_ZIP_PATH` (ruta al zip en el workspace del job)

Buenas practicas:

- almacenar credenciales en Environment Secrets,
- separar secretos por entorno,
- rotar secretos periodicamente,
- nunca guardar secretos en repo ni logs.

Compatibilidad con contrato actual de `deploy/README.md`:

- mantener variables existentes de soluciones:
  - `SOLUTIONS_TOOL_MODE` (`pac`/`script`)
  - `SOLUTIONS_PACKAGE_PATTERN`
  - `SOLUTIONS_TARGET_DEV`
  - `SOLUTIONS_TARGET_PRE`
  - `SOLUTIONS_TARGET_PRO`
- mantener variables de WFA si se automatiza ese tramo:
  - `WFA_TOOL_MODE`
  - `WFA_PACKAGE_PATTERN`
  - `WFA_TARGET_DEV`
  - `WFA_TARGET_PRE`
  - `WFA_TARGET_PRO`

---

## 6) Autenticacion no interactiva con `pac`

Ejemplo con service principal:

```powershell
pac auth create `
  --url "$env:PP_ENV_URL" `
  --tenant "$env:PP_TENANT_ID" `
  --applicationId "$env:PP_CLIENT_ID" `
  --clientSecret "$env:PP_CLIENT_SECRET" `
  --name "ci-$env:GITHUB_RUN_ID"
```

Comprobar contexto:

```powershell
pac auth list
pac org who
```

Limpiar al final del job:

```powershell
pac auth clear
```

---

## 7) Comandos de despliegue con `pac`

### 7.1 Importar solucion

```powershell
pac solution import `
  --path "$env:SOLUTION_ZIP_PATH" `
  --publish-changes `
  --max-async-wait-time 60
```

Notas:

- `--publish-changes` evita un paso manual posterior.
- ajustar timeout segun tamano y complejidad.

### 7.2 Publicar personalizaciones (si no se uso flag anterior)

```powershell
pac solution publish
```

### 7.3 Validaciones basicas post-import

```powershell
pac org who
pac solution list
```

Opcional: validaciones funcionales (smoke tests) en API/entidad critica.

---

## 8) Ejemplo de integracion en el flujo CD actual

Ejemplo de paso para `deploy-solutions.ps1` (no sustituye el workflow completo existente):

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Descargar artefacto del CI
    uses: actions/download-artifact@v4
    with:
      name: drop
      run-id: ${{ github.event.workflow_run.id || github.event.inputs.run_id }}

  - name: Instalar Power Platform CLI
    uses: microsoft/powerplatform-actions/actions-install@v1

  - name: Desplegar soluciones con pac
    shell: pwsh
    env:
      PP_ENV_URL: ${{ secrets.PP_ENV_URL }}
      PP_TENANT_ID: ${{ secrets.PP_TENANT_ID }}
      PP_CLIENT_ID: ${{ secrets.PP_CLIENT_ID }}
      PP_CLIENT_SECRET: ${{ secrets.PP_CLIENT_SECRET }}
      SOLUTIONS_TOOL_MODE: pac
      SOLUTIONS_PACKAGE_PATTERN: "*.zip"
    run: |
      ./deploy/deploy-solutions.ps1 -Environment DEV
```

Importante para este repo:

- no romper la secuencia actual del CD (`DEV -> PRE -> PRO`),
- conservar la validacion `check-day-25` antes de `deploy-pro`,
- en ejecucion manual de CD, respetar `run_id` obligatorio.

---

## 9) Implementacion recomendada (sin redisenar pipeline)

Para quedar 100% alineado al proyecto actual:

1. **Mantener triggers y jobs actuales** de `cd.yml` y `rollback.yml`.
2. **Completar scripts existentes**:
   - `deploy/deploy-solutions.ps1`: import real con `pac solution import`.
   - `deploy/deploy-wfa.ps1`: import real si aplica con tool soportada.
3. **Usar `SOLUTIONS_TOOL_MODE=pac`** por entorno.
4. **Conservar accion compuesta** `deploy-dynamics` como orquestador.
5. **No mover la logica de gate** de dia 25 fuera del workflow.

---

## 10) Rollback con `pac` (alineado a `rollback.yml`)

Flujo real del repo:

- lanzar `Rollback` manual en GitHub Actions,
- informar `target_environment` (`DEV`/`PRE`/`PRO`),
- informar `run_id` del CI estable a restaurar,
- descargar `drop` de ese `run_id` y ejecutar despliegue en mismo orden tecnico.

Comando base:

```powershell
pac solution import `
  --path "$env:PREVIOUS_STABLE_SOLUTION_ZIP" `
  --publish-changes `
  --max-async-wait-time 60
```

Practicas recomendadas:

- simular rollback periodicamente en entorno no productivo,
- guardar trazabilidad (`run_id`, version restaurada, entorno, motivo),
- alinear con `docs/PROCEDIMIENTO_ROLLBACK.md`.

---

## 11) Seguridad y permisos

Recomendaciones minimas:

- Service Principal distinto por entorno sensible (ideal PRE/PRO separados).
- Privilegios minimos necesarios en Dataverse (evitar privilegios globales innecesarios).
- Secrets solo en Environments; nunca hardcode.
- Aprobaciones obligatorias en `pre` y `prod`.
- Branch protections y `CODEOWNERS` activos para cambios de pipeline/deploy.

---

## 12) Errores comunes y solucion rapida

1. `pac` no reconocido:
   - instalar CLI en job y validar `pac --version`.
2. fallo de auth:
   - revisar tenant/client/secret/url y permisos del app registration.
3. timeout en import:
   - ampliar `--max-async-wait-time` y revisar tamano/dependencias de solucion.
4. import parcial o errores de dependencia:
   - validar orden de soluciones y prerequisitos en entorno destino.
5. deploy correcto pero funcionalidad no visible:
   - forzar publicacion de cambios y ejecutar smoke tests.

---

## 13) Checklist de adopcion

- [ ] Runner con conectividad real a Dataverse y Entra ID.
- [ ] Service Principal creado con permisos validados por entorno.
- [ ] Secrets configurados por `dev/pre/pro`.
- [ ] `deploy-solutions.ps1` integrado con `pac solution import`.
- [ ] `cd.yml` mantiene la secuencia actual y el uso de artefacto `drop`.
- [ ] `cd.yml` manual sigue exigiendo `run_id`.
- [ ] `check-day-25` se mantiene antes de `deploy-pro`.
- [ ] Promocion validada en PRE con aprobaciones.
- [ ] Rollback probado en `rollback.yml` con `target_environment` + `run_id`.
- [ ] Runbook/documentacion actualizados.

---

## 14) Referencias internas

- `docs/RUNBOOK_DESPLIEGUE.md`
- `docs/PROCEDIMIENTO_ROLLBACK.md`
- `docs/SELF_HOSTED_RUNNER_GUIA.md`
- `docs/GITHUB_HOSTED_RUNNERS_GUIA.md`
- `docs/HOJA_RUTA_AUTOMATIZACION_CI_CD.md`

