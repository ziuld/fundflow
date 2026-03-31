# Runbook de incidencias CI/CD

Objetivo: responder de forma estandarizada a incidentes de pipeline/despliegue y reducir tiempo de recuperacion.

---

## 1. Clasificacion de incidencia

- **P1 (critica):** impacto en `PRO`, servicio degradado o caido.
- **P2 (alta):** bloqueo de despliegue en `PRE/PRO` sin impacto productivo inmediato.
- **P3 (media):** fallo en `DEV`/CI o incidencia sin impacto operativo directo.

---

## 2. Flujo de respuesta

1. Detectar y registrar incidente (id, hora, entorno, `run_id`).
2. Clasificar severidad (P1/P2/P3).
3. Aplicar diagnostico inicial (seccion 3).
4. Ejecutar mitigacion (rollback, reintento, fix rapido).
5. Comunicar estado y cierre.
6. Registrar RCA y acciones preventivas.

---

## 3. Diagnostico rapido por tipo

### A) Fallo en CI

- Revisar step exacto en `ci.yml`.
- Validar cambios recientes en workflows/dependencias.
- Si bloquea release, abrir hotfix en pipeline o revert de cambios de CI.

### B) Fallo en CD (deploy)

- Identificar etapa fallida (`BL/plugins/WFA/soluciones/WebAPI/IBI`).
- Revisar variables/secrets y conectividad runner -> nodo.
- Si impacto en `PRO`, evaluar rollback inmediato.

### C) Fallo en rollback

- Validar `run_id` correcto y existencia de artefacto `drop`.
- Revisar mismos prerequisitos que CD (variables/red/permisos).
- Si no recupera automaticamente, ejecutar rollback manual de contingencia.

---

## 4. Acciones de contencion recomendadas

- P1 en `PRO`: congelar despliegues, comunicar incidencia, iniciar rollback.
- P2 en `PRE`: detener promocion a `PRO` hasta validacion completa.
- P3 en `DEV`: corregir pipeline y reintentar.

---

## 5. Comunicacion (plantilla breve)

Mensaje inicial:

- Incidente:
- Entorno:
- `run_id`:
- Impacto:
- Accion en curso:
- ETA proxima actualizacion:

Mensaje cierre:

- Causa raiz:
- Accion aplicada:
- Estado final:
- Acciones preventivas:

---

## 6. Escalado

- L1 Soporte/Operacion (deteccion y primer triage)
- L2 DevOps (pipeline/secrets/runner)
- L3 Tech Lead + Desarrollo (correccion tecnica)
- Infra/Seguridad segun causa (red, permisos, credenciales)

---

## 7. Postmortem minimo

- [ ] Timeline del incidente.
- [ ] Causa raiz validada.
- [ ] Medidas correctivas aplicadas.
- [ ] Medidas preventivas planificadas (owner + fecha).
- [ ] Documentacion/runbook actualizado.
