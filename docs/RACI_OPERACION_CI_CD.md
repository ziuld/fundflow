# Matriz RACI de operacion CI/CD

Objetivo: definir responsabilidades por proceso para operar `CI`, `CD` y `Rollback` sin ambiguedades.

Leyenda:

- **R** Responsible (ejecuta)
- **A** Accountable (aprueba/decide)
- **C** Consulted (consultado)
- **I** Informed (informado)

---

## Roles

- Dev
- Tech Lead
- DevOps
- Infra
- Soporte/Operacion
- Seguridad
- Negocio/Owner

---

## Matriz

| Actividad | Dev | Tech Lead | DevOps | Infra | Soporte/Operacion | Seguridad | Negocio |
|-----------|-----|-----------|--------|-------|-------------------|-----------|---------|
| Mantenimiento de workflows CI/CD | C | A | R | C | I | I | I |
| Gestion de secrets/variables por entorno | I | C | R | C | I | A | I |
| Proteccion de ramas/CODEOWNERS | C | A | R | I | I | C | I |
| Ejecucion de despliegue a DEV | R | C | A | I | C | I | I |
| Ejecucion de despliegue a PRE | C | C | A | I | R | I | I |
| Autorizacion despliegue a PRO | I | A | R | C | C | C | A |
| Ejecucion rollback | C | A | R | C | R | I | I |
| Validacion tecnica post-deploy | R | A | C | I | C | I | I |
| Validacion funcional post-deploy | C | C | I | I | R | I | A |
| Gestion de incidentes CI/CD | C | A | R | C | R | C | I |
| Rotacion de credenciales | I | C | R | C | I | A | I |
| Aprobacion go-live final | I | A | A | A | C | C | A |

---

## Notas

- La matriz debe revisarse al menos trimestralmente o tras cambios organizativos.
- Ajustar owners reales y aliases de equipos en GitHub.
