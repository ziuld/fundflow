# Plan de formacion operacion CI/CD

Objetivo: asegurar que el equipo receptor puede operar despliegues y rollback de forma autonoma.

---

## 1. Publico objetivo

- Devs
- DevOps
- Soporte/Operacion
- Infra (sesion tecnica de integracion)

---

## 2. Itinerario formativo sugerido

### Sesion 1 - Arquitectura y flujo (90 min)

- Estructura del repo.
- Flujo Git/PR/CODEOWNERS.
- CI/CD/rollback: vision completa.

### Sesion 2 - Operacion de despliegue (120 min)

- Uso de `ci.yml` y `cd.yml`.
- Uso de `run_id` y ejecucion manual.
- Variables/secrets por entorno.

### Sesion 3 - Rollback e incidencias (120 min)

- Uso de `rollback.yml`.
- Simulacro de incidente y comunicacion.
- Criterios go/no-go.

### Sesion 4 - Practica guiada (120 min)

- Despliegue en entorno de prueba.
- Rollback controlado.
- Cierre de checklist operativo.

---

## 3. Materiales

- `docs/README.md`
- `docs/RUNBOOK_DESPLIEGUE.md`
- `docs/PROCEDIMIENTO_ROLLBACK.md`
- `docs/RUNBOOK_INCIDENCIAS_CI_CD.md`
- `docs/CHECKLIST_GO_LIVE_CI_CD.md`

---

## 4. Criterios de certificacion interna

Por participante:

- [ ] Ejecuta despliegue manual con `run_id` correctamente.
- [ ] Ejecuta rollback por `run_id`.
- [ ] Interpreta logs de pipeline y detecta fallo de etapa.
- [ ] Conoce proceso de escalado y comunicacion.

Resultado:

- Apto / No apto
- Observaciones:

---

## 5. Plan de refresco

- Frecuencia sugerida: trimestral.
- Gatillos de refresco:
  - cambios importantes en workflows/scripts,
  - alta de nuevos operadores,
  - incidentes P1/P2 con aprendizaje relevante.
