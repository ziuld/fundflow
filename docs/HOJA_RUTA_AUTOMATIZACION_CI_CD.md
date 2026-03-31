# Hoja de ruta para completar automatizacion CI/CD

Objetivo: cerrar todos los pendientes para que `CI`, `CD`, `Rollback` y scripts de `deploy/` queden operativos de extremo a extremo.

Estado de partida: pipelines y scripts en estructura funcional, con bloques `TODO (externo)` para datos de entorno e integraciones corporativas.

---

## 1. Resumen de estado actual

- `CI`: implementado y endurecido (build/test + validacion docs + artefacto `drop`).
- `CD`: implementado con promocion por entornos y gate de dia 25.
- `Rollback`: implementado por `workflow_dispatch` con `run_id`.
- `deploy/`: scripts base operativos para validacion/copia, pendientes de integracion real en partes externas (WFA/soluciones/reinicio remoto).

---

## 2. Tareas por bloque

## Bloque A - Infraestructura y conectividad (critico)

1. Definir modelo de runner para CD/rollback:
   - hosted puro o self-hosted en red corporativa.
2. Validar conectividad a destinos PRE/PRO:
   - shares UNC, nodos WebAPI, puertos remotos, DNS.
3. Confirmar metodo de ejecucion remota:
   - WinRM / Invoke-Command / agente corporativo.

Dependencias externas:

- Infraestructura (red, firewall, DNS, cuentas de servicio).

---

## Bloque B - Secrets, variables y configuracion (critico)

Configurar en GitHub Environments (`dev`, `pre`, `prod`) las variables:

- BL: `BL_TARGET_ROOT_*`, `BL_PACKAGE_PATTERN`
- Plugins: `PLUGINS_TARGET_ROOT_*`, `PLUGINS_PACKAGE_PATTERN`
- WebAPI: `WEBAPI_DEPLOY_PATH_*`, `WEBAPI_NODES_*`, `WEBAPI_PACKAGE_PATTERN`, `WEBAPI_RUN_BATCHES`
- WFA: `WFA_TOOL_MODE`, `WFA_PACKAGE_PATTERN`, `WFA_TARGET_*`
- Soluciones: `SOLUTIONS_TOOL_MODE`, `SOLUTIONS_PACKAGE_PATTERN`, `SOLUTIONS_TARGET_*`

Y los secretos:

- credenciales de servicio por entorno,
- credenciales de herramientas Dynamics/PAC,
- certificados/keys si aplica.

Dependencias externas:

- DevOps + Seguridad + Infra.

---

## Bloque C - Integracion real de despliegues (critico)

1. Completar `deploy/deploy-wfa.ps1`:
   - integrar importacion real (PAC o script corporativo).
2. Completar `deploy/deploy-solutions.ps1`:
   - integrar import de zips de soluciones por entorno.
3. Completar `deploy/deploy-webapi.ps1`:
   - ejecutar batches remotos reales cuando `WEBAPI_RUN_BATCHES=true`.
4. Completar `deploy/ibi-checklist.ps1`:
   - comandos de reinicio reales (si se decide automatizar).

Dependencias externas:

- Equipo funcional Dynamics + Infra (comandos oficiales y validacion operativa).

---

## Bloque D - Gobierno y seguridad (alto)

1. Revisar y ajustar `/.github/CODEOWNERS` con equipos reales.
2. Configurar approvals por environment (`pre`, `prod`).
3. Confirmar branch protection en `develop` y `main`.
4. Definir rotacion de secretos y plan de contingencia.

Dependencias externas:

- DevOps + Seguridad + responsables de repositorio.

---

## Bloque E - Calidad operativa (medio)

1. Añadir smoke tests post-deploy por entorno.
2. Estandarizar evidencia de release:
   - `run_id`, entorno, version, resultado.
3. Ejecutar simulacros de rollback trimestrales.

Dependencias externas:

- Desarrollo + QA + Operacion.

---

## 3. Mapa de TODOs actuales (ficheros)

### Scripts de despliegue

- `deploy/deploy-bl.ps1`
  - TODO: mecanismo real de registro/publicacion BL (GAC/proceso corporativo).
- `deploy/deploy-plugins.ps1`
  - TODO: registro/import real de plugins/steps CRM.
- `deploy/deploy-webapi.ps1`
  - TODO: ejecucion remota de batches (AfterPublicWebAPI/iisreset/ASYNC).
- `deploy/ibi-checklist.ps1`
  - TODO: comandos de reinicio reales por entorno.
- `deploy/deploy-wfa.ps1`
  - TODO: import real de workflows/actions.
- `deploy/deploy-solutions.ps1`
  - TODO: import real de soluciones Dynamics.

### Workflows/acciones

- `.github/actions/deploy-dynamics/action.yml`
  - ya invoca scripts WFA/soluciones si existen.
  - pendiente: comportamiento final cuando scripts pasen a modo real.

---

## 4. Datos que se deben pedir a Infra / otros equipos

## Infraestructura

- Inventario de nodos por entorno.
- Rutas destino oficiales por componente.
- Metodo remoto permitido y puertos abiertos.
- Cuenta de servicio y permisos efectivos.

## DevOps

- Estrategia runner final (hosted/self-hosted mixto).
- Gestion de secrets por environment.
- Politica de aprobaciones y auditable trail.

## Equipo Dynamics/Aplicacion

- Comando oficial para importar WFA.
- Comando oficial para importar soluciones.
- Orden y parametros exactos de batches WebAPI.
- Criterios de validacion funcional post-deploy.

---

## 5. Plan de ejecucion sugerido

Fase 1:

- Cerrar bloques A y B (infra + variables/secrets).

Fase 2:

- Ejecutar bloque C en `DEV` (WFA/soluciones/WebAPI real + IBI definido).

Fase 3:

- Promocion a `PRE` con smoke tests (bloque E parcial).

Fase 4:

- Cierre de gobierno y puesta en marcha en `PRO` con rollback probado.

---

## 6. Definicion de "completo"

Automatizacion completa cuando:

- `CD` despliega en PRE/PRO sin pasos manuales no documentados,
- `Rollback` revierte por `run_id` en tiempo objetivo acordado,
- todos los TODOs de scripts estan cerrados o explicitamente aceptados,
- variables/secrets/approvals estan definidos y auditables,
- runbook y procedimiento de rollback reflejan exactamente la operativa real.
