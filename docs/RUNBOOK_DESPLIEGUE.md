# Runbook - Procedimiento de despliegue

Objetivo: ejecutar despliegues con los workflows de GitHub Actions de forma repetible y segura.

---

## 1. Alcance y precondiciones

- Alcance: despliegue a `DEV`, `PRE` y `PRO` usando artefactos del workflow `CI`.
- Orden tecnico obligatorio: `BL -> plugins -> actions WFA -> soluciones -> WebAPI`, y post `BL/AIS`.
- Restriccion: no desplegar a `PRO` desde el dia 25 del mes.
- Para ejecucion manual de `CD` es obligatorio indicar `run_id` del `CI` que genero el artefacto.
- Estado actual: el flujo esta operativo, pero hay bloques de despliegue que dependen de configuracion externa de Infra/Dynamics (ver seccion 6).

---

## 2. Workflows implicados

| Workflow | Uso |
|----------|-----|
| `.github/workflows/ci.yml` | Genera el artefacto `drop`. |
| `.github/workflows/cd.yml` | Promociona `drop` por entornos (`DEV -> PRE -> PRO`). |
| `.github/workflows/rollback.yml` | Re-despliega una version anterior (`run_id`) sobre un entorno objetivo. |
| `.github/actions/deploy-dynamics/action.yml` | Accion compuesta que ejecuta el orden tecnico de despliegue. |

---

## 3. Procedimiento de despliegue normal

### 3.1 Antes del despliegue

1. Identificar el `run_id` correcto de `CI` (artefacto `drop`).
2. Confirmar validaciones tecnicas del entorno anterior (`DEV` antes de `PRE`, `PRE` antes de `PRO`).
3. Confirmar ventana operativa y restriccion de dia 25 para `PRO`.
4. Tener a mano el procedimiento de rollback: [PROCEDIMIENTO_ROLLBACK.md](PROCEDIMIENTO_ROLLBACK.md).

### 3.2 Despliegue automatico (recomendado)

1. Hacer merge a `develop` con `CI` en verde.
2. `CD` se dispara tras `CI` exitoso.
3. Verificar progreso de jobs:
   - `deploy-dev`
   - `deploy-pre`
   - `check-day-25`
   - `deploy-pro`

### 3.3 Despliegue manual (`workflow_dispatch` de CD)

1. Lanzar `.github/workflows/cd.yml` manualmente.
2. Informar `run_id` del `CI` a desplegar (obligatorio).
3. Verificar que el job `validate-dispatch` finaliza en OK.
4. Validar ejecucion secuencial de entornos.

### 3.4 Scripts invocados por la accion compuesta

Durante `CD`, se invocan estos scripts:

- `deploy/deploy-bl.ps1`
- `deploy/deploy-plugins.ps1`
- `deploy/deploy-wfa.ps1` (si existe)
- `deploy/deploy-solutions.ps1` (si existe)
- `deploy/deploy-webapi.ps1`
- `deploy/ibi-checklist.ps1`

Cada script admite variables por entorno; revisar contrato en `deploy/README.md`.

---

## 4. Validaciones post-despliegue

- [ ] Servicios/CRM accesibles en el entorno desplegado.
- [ ] Sin errores criticos en logs.
- [ ] Version desplegada coincide con `run_id` esperado.
- [ ] Comunicacion de cierre (especialmente en `PRO`).

---

## 5. Notas operativas

- `BL`: aplicar aviso y reinicio segun protocolo cuando hay impacto en BL.
- `AIS`: en `PRO` puede seguir siendo paso manual por Tech Lead segun entorno real.
- Si falla cualquier etapa, no continuar promocion y ejecutar rollback.
- `CD` usa `concurrency` para evitar ejecuciones solapadas en la misma rama.

---

## 6. Pendientes externos para despliegue totalmente automatico

Estos puntos no dependen solo del repositorio y deben cerrarse con Infra/DevOps/Dynamics:

- Definir variables/secrets finales por entorno (`dev`, `pre`, `prod`).
- Confirmar conectividad real del runner hacia nodos destino.
- Integrar import real de WFA (`deploy-wfa.ps1`) con herramienta oficial.
- Integrar import real de soluciones (`deploy-solutions.ps1`) con herramienta oficial.
- Definir ejecucion remota real de batches WebAPI y comandos BL.
- Confirmar si `AIS` se automatiza o se mantiene manual en `PRO`.

---

## 7. Referencias

| Documento | Uso |
|-----------|-----|
| [PROCEDIMIENTO_ROLLBACK.md](PROCEDIMIENTO_ROLLBACK.md) | Reversion controlada por `run_id`. |
| [GLOSARIO.md](GLOSARIO.md) | Terminologia operativa. |
| [README de .github](../.github/README.md) | Resumen de workflows y automatizacion. |
| [deploy/README.md](../deploy/README.md) | Variables y contrato de configuracion de scripts. |
| [HOJA_RUTA_AUTOMATIZACION_CI_CD.md](HOJA_RUTA_AUTOMATIZACION_CI_CD.md) | Roadmap de cierre de pendientes. |
| [CHECKLIST_GO_LIVE_CI_CD.md](CHECKLIST_GO_LIVE_CI_CD.md) | Checklist de salida a produccion. |
