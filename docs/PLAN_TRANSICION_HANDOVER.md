# Plan de transicion y handover

Objetivo: formalizar la transferencia operativa del proyecto `legalitas-crm` al equipo receptor (Soporte/DevOps/Operaciones), con criterios de aceptacion claros.

---

## 1. Alcance de la transicion

Incluye:

- Repositorio y gobierno (`README`, `docs/`, `CODEOWNERS`, protecciones).
- Operacion CI/CD (`ci.yml`, `cd.yml`, `rollback.yml`).
- Scripts de despliegue (`deploy/*.ps1`) y su configuracion.
- Procedimientos de despliegue, rollback y go-live.

No incluye:

- Desarrollos funcionales nuevos fuera del alcance acordado.
- Cambios de arquitectura de plataforma no aprobados.

---

## 2. Entregables

- [ ] Documentacion actualizada y aprobada.
- [ ] Variables/secrets por entorno definidos y validados.
- [ ] Evidencia de despliegue end-to-end en `PRE`.
- [ ] Evidencia de rollback por `run_id`.
- [ ] Checklist go-live completado.
- [ ] Matriz RACI validada por responsables.

---

## 3. Hitos de transicion

1. **Hito A - Preparacion**
   - Cierre de pendientes tecnicos criticos.
2. **Hito B - Validacion operativa**
   - Despliegue y rollback controlados en `PRE`.
3. **Hito C - Shadow period**
   - Operacion asistida por equipo implementador.
4. **Hito D - Handover final**
   - Operacion autonoma del equipo receptor.

---

## 4. Criterios de aceptacion

- [ ] CI estable en rama objetivo.
- [ ] CD/rollback ejecutables por runbook.
- [ ] Sin bloqueos criticos abiertos de Infra/Seguridad.
- [ ] Tiempos de recuperacion (rollback) dentro de objetivo acordado.
- [ ] Equipo receptor formado y validado.

---

## 5. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigacion | Owner |
|--------|---------|------------|-------|
| Falta de conectividad runner -> nodos | Alto | Validacion previa de red, fallback self-hosted | Infra |
| Variables/secrets incompletos | Alto | Checklist por environment y doble revision | DevOps |
| Procedimiento rollback no probado | Alto | Simulacro previo obligatorio | Operaciones |
| Dependencia de pasos manuales no documentados | Medio/Alto | Documentar y aprobar excepciones | Tech Lead |

---

## 6. Plan de soporte en transicion (hypercare)

- Duracion sugerida: tras go-live.
- Cobertura:
  - Ventana laboral + guardia en ventanas de despliegue.
- Escalado:
  - L1 Soporte -> L2 DevOps -> L3 Tech Lead/Equipo desarrollo.

---

## 7. Aprobaciones de handover

- Responsable tecnico (implementador):
- Responsable DevOps:
- Responsable Infra:
- Responsable Operaciones:
- Fecha de traspaso:
