# CODEOWNERS – Configuración y ejemplo

Este documento explica cómo configurar **revisores por ruta** en el repositorio usando el fichero **.github/CODEOWNERS** (GitHub) o **CODEOWNERS** en la raíz (Azure Repos).

---

## Uso

- **CODEOWNERS** asigna automáticamente revisores a los PR según las rutas modificadas.
- Todo cambio en rutas críticas (plugins, BL/IBL, webresources, deploy) debe ser revisado por el **Tech Lead** del grupo funcional correspondiente (Finanzas, Operaciones).
- Sustituir los placeholders (`@tech-lead-finanzas`, `@tech-lead-operaciones`, `@equipo-legalitas-crm`) por los **usernames** o **teams** reales de tu organización (ej. `@org/tech-lead-finanzas` en GitHub).
- En este repositorio ya existe `/.github/CODEOWNERS`; mantener este documento sincronizado con ese fichero real.

---

## Ejemplo para .github/CODEOWNERS

Copiar el siguiente contenido a **.github/CODEOWNERS** en la raíz del repo y ajustar usernames/teams:

```
# CODEOWNERS – legalitas-crm
# Sustituir @tech-lead-finanzas, @tech-lead-operaciones y @equipo-legalitas-crm
# por usernames o teams reales (ej. @org/tech-lead-finanzas).

# Rutas críticas: Tech Lead por grupo funcional (Finanzas, Operaciones)
/plugins/                    @tech-lead-finanzas @tech-lead-operaciones
/webresources/               @tech-lead-finanzas @tech-lead-operaciones

# Si BL vive en el mismo repo (carpeta bl o similar), descomentar:
# /bl/                    @tech-lead-finanzas @tech-lead-operaciones

# Scripts de despliegue: revisión por Tech Lead o DevOps
/deploy/                     @tech-lead-finanzas @tech-lead-operaciones

# Soluciones y configuración de pipeline
/solutions/                  @tech-lead-operaciones
.github/                     @tech-lead-operaciones

# Resto del repo: equipo por defecto
*                           @equipo-legalitas-crm
```

---

## Reglas

- La **última coincidencia** por ruta gana: si un fichero coincide con varias líneas, se usan los owners de la línea más específica.
- En GitHub, los **teams** se referencian como `@org/team-name`.
- Todo PR que toque esas rutas requerirá **al menos una aprobación** de los owners listados (según la configuración de protección de rama).
- Tras cualquier cambio en ownership, validar branch protections y approvals de `Environments`.

Ver [GOBIERNO_REPOSITORIO.md](GOBIERNO_REPOSITORIO.md) para protección de ramas, [CONTRIBUTING.md](CONTRIBUTING.md) para flujo PR y [CHECKLIST_GO_LIVE_CI_CD.md](CHECKLIST_GO_LIVE_CI_CD.md) para salida a producción.

---

*Última actualización: Febrero 2026*
