# Guia de contribucion

Objetivo: definir como contribuir al repositorio del CRM. Todo cambio que deba integrarse en `develop` sigue flujo de `Pull Request` y revision.

## 1. Flujo de trabajo

1. Crear rama desde `develop`:
   - `feature/1234-descripcion` para nuevas funcionalidades.
   - `bug/1234-descripcion` para correcciones.
2. Realizar commits en la rama de trabajo (recomendado: `[#id] descripcion`).
3. Publicar rama remota.
4. Abrir `Pull Request` contra `develop`.
5. Atender revision de `CODEOWNERS`/revisores asignados.
6. Aplicar cambios solicitados.
7. Merge tras aprobacion y checks en verde.

## 2. Estrategia de ramas

| Rama | Uso | Restriccion |
|------|-----|-------------|
| `main` | Codigo en produccion | Solo merge desde `release/*` o `hotfix/*` |
| `develop` | Integracion continua de trabajo | Solo cambios via PR aprobado |
| `feature/*` | Nuevas funcionalidades | Desde `develop`, merge a `develop` |
| `bug/*` | Correcciones | Desde `develop`, merge a `develop` |
| `release/*` | Preparacion de version | Desde `develop`, merge a `main` y `develop` |
| `hotfix/*` | Correccion urgente en produccion | Desde `main`, merge a `main` y `develop` |

## 3. Convenciones

- Commits: `[#id] Descripcion breve` (recomendado).
- Tags de release en `main`: `vX.Y.Z`.
- No push directo a `main` ni a `develop`.

