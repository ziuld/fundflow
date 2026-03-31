# Procedimiento de rollback

Objetivo: revertir una entrega a una version anterior de forma controlada y trazable.

---

## 1. Cuando activar rollback

- Validacion fallida tras despliegue (`DEV`, `PRE` o `PRO`).
- Incidencia critica tras promocion a `PRO`.
- Decision operativa de cancelar release y volver a version estable.

---

## 2. Principio operativo

- No recompilar en local.
- Usar artefacto `drop` de un `run_id` de `CI` ya conocido y estable.
- Ejecutar mismo orden tecnico que despliegue normal:
  `BL -> plugins -> actions WFA -> soluciones -> WebAPI` (+ `BL/AIS` si aplica).
- El rollback reutiliza la accion compuesta de despliegue, por lo que comparte los mismos prerequisitos de variables y conectividad.

---

## 3. Rollback automatizado (recomendado)

Workflow: `.github/workflows/rollback.yml`

### Inputs obligatorios

- `target_environment`: `DEV` | `PRE` | `PRO`
- `run_id`: identificador del `CI` cuya version se quiere restaurar

### Pasos

1. Abrir Actions y lanzar workflow `Rollback`.
2. Seleccionar `target_environment`.
3. Indicar `run_id` de la version previa estable.
4. Ejecutar workflow y monitorizar job `rollback`.
5. Confirmar que finaliza en verde.

### Notas importantes

- `rollback.yml` descarga artefacto `drop` directamente por `run_id`.
- Si el entorno no tiene variables/secrets completos, el rollback fallara igual que el despliegue normal.
- Si WFA/soluciones siguen en modo base (sin import real), el rollback de esos componentes sera parcial.

---

## 4. Comprobaciones post-rollback

- [ ] CRM/servicios accesibles en el entorno revertido.
- [ ] Sin errores criticos en logs.
- [ ] Version activa corresponde al `run_id` indicado.
- [ ] Comunicacion de cierre (si entorno `PRO`, incluir negocio/usuarios afectados).

---

## 5. Rollback manual (solo contingencia)

Usar este modo solo si GitHub Actions no esta disponible:

1. Obtener artefacto estable anterior.
2. Ejecutar despliegue manual respetando orden tecnico.
3. Ejecutar pasos operativos de `BL/AIS` segun entorno.
4. Validar y comunicar resultado.

Casos donde aplicar rollback manual:

- GitHub Actions no disponible.
- Incidencia de conectividad runner -> destino.
- Necesidad de ejecutar comandos de infraestructura fuera de pipeline.

---

## 6. Registro posterior

- Registrar incidente, causa, `run_id` revertido y `run_id` restaurado.
- Documentar acciones correctivas antes de nuevo intento de release.
- Actualizar la hoja de ruta si el fallo revela nuevos requisitos de Infra/DevOps.

---

## 7. Referencias

| Documento | Uso |
|-----------|-----|
| [RUNBOOK_DESPLIEGUE.md](RUNBOOK_DESPLIEGUE.md) | Flujo normal de despliegue y validaciones. |
| [GLOSARIO.md](GLOSARIO.md) | Terminologia operativa (BL, AIS, artefacto, rollback). |
| [README de .github](../.github/README.md) | Resumen de workflows. |
| [deploy/README.md](../deploy/README.md) | Variables y prerequisitos de scripts de despliegue. |
| [HOJA_RUTA_AUTOMATIZACION_CI_CD.md](HOJA_RUTA_AUTOMATIZACION_CI_CD.md) | Pendientes de cierre para automatizacion completa. |
