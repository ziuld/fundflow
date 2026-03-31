# Guia de formacion: Git, Gitflow y operacion del repositorio

Audiencia objetivo: personas que nunca han usado Git y personas que necesitan operar este repositorio con seguridad.

---

## 1) Objetivos de aprendizaje

Al finalizar la sesion, el equipo debe ser capaz de:

- Entender la estructura de `application` y donde tocar cada tipo de cambio.
- Trabajar con Git desde cero: clonar, crear rama, commit, push y Pull Request.
- Aplicar el Gitflow del proyecto (`develop`, `main`, `feature/*`, `bug/*`, `release/*`, `hotfix/*`).
- Entender como funcionan CI/CD, rollback y la restriccion operativa del dia 25.
- Publicar versiones con tags (`vX.Y.Z`) y trazabilidad `release -> artefacto -> entorno`.
- Respetar permisos, protecciones de rama y ownership por `CODEOWNERS`.

---

## 2) Mapa rapido del repositorio

Estructura principal:

- `plugins/`: backend .NET (CRM, DTO, procesos, integraciones, WebAPI, etc.).
- `webresources/`: recursos frontend del CRM (JS/HTML/CSS).
- `solutions/`: soluciones Dynamics exportadas.
- `unpacked/`: soluciones desempaquetadas para diff/revision.
- `deploy/`: scripts PowerShell de despliegue por entorno.
- `.github/`: workflows de CI/CD/rollback y accion compuesta de despliegue.
- `docs/`: guias funcionales, tecnicas y operativas.

Regla mental para nuevos miembros:

- Si cambias logica .NET, normalmente tocaras `plugins/`.
- Si cambias UI o scripts de CRM cliente, tocaras `webresources/`.
- Si cambias automatizacion o governance, tocaras `.github/`, `deploy/` o `docs/`.

---

## 3) Conceptos Git explicados para principiantes

### 3.1 Que es Git

Git es un sistema de control de versiones distribuido. Permite:

- Guardar historial de cambios.
- Trabajar en paralelo con ramas.
- Revisar y aprobar cambios antes de integrarlos.
- Recuperar estados anteriores.

### 3.2 Conceptos clave

- `working tree`: tus archivos locales.
- `staging area` (index): zona intermedia antes del commit.
- `commit`: foto con mensaje de un conjunto de cambios.
- `branch`: linea de trabajo independiente.
- `remote`: copia del repo en servidor (GitHub).
- `merge`: integrar historial de una rama en otra.
- `rebase`: reescribir base de commits sobre otra rama.
- `tag`: etiqueta fija de version.

---

## 4) Instalacion y primer contacto

## 4.1 Instalar Git

- Windows: instalar Git for Windows.
- Verificar instalacion:

```bash
git --version
```

### 4.2 Configuracion minima local

```bash
git config --global user.name "Nombre Apellido"
git config --global user.email "nombre@empresa.com"
git config --global pull.rebase false
```

Nota formativa: `pull.rebase false` fuerza comportamiento por merge en `git pull`, mas facil de entender para perfiles junior. El equipo avanzado puede usar rebase si esta alineado con la politica del proyecto.

### 4.3 Clonado inicial del repositorio

```bash
git clone <url-del-repo>
cd folder
git checkout develop
git pull origin develop
```

---

## 5) Flujo oficial del proyecto (Gitflow aplicado aqui)

Ramas y uso:

- `main`: produccion (estable).
- `develop`: integracion continua del trabajo del equipo.
- `feature/*`: nuevas funcionalidades, salen de `develop` y vuelven a `develop`.
- `bug/*`: correcciones no urgentes, salen de `develop` y vuelven a `develop`.
- `release/*`: preparacion de release, salen de `develop`, merge a `main` y vuelta a `develop`.
- `hotfix/*`: urgente en produccion, salen de `main`, merge a `main` y `develop`.

Reglas obligatorias:

- No push directo a `main` ni `develop`.
- Todo entra por Pull Request.
- Revisiones obligatorias segun `CODEOWNERS`.
- CI en verde antes del merge.

---

## 6) Ciclo de trabajo diario (paso a paso)

### 6.1 Empezar una tarea

```bash
git checkout develop
git pull origin develop
git checkout -b feature/1234-nombre-corto
```

### 6.2 Revisar cambios y preparar commit

```bash
git status
git add .
git status
git commit -m "[#1234] Añade validacion de campo en formulario CRM"
```

### 6.3 Publicar rama y abrir PR

```bash
git push -u origin feature/1234-nombre-corto
```

Despues: abrir Pull Request contra `develop` en GitHub.

### 6.4 Mantener rama actualizada con `develop`

Opcion A (recomendada para principiantes): merge

```bash
git checkout feature/1234-nombre-corto
git fetch origin
git merge origin/develop
```

Opcion B (avanzado): rebase

```bash
git checkout feature/1234-nombre-corto
git fetch origin
git rebase origin/develop
```

---

## 7) Comandos Git mas comunes (chuleta para clase)

### 7.1 Consulta de estado e historial

```bash
git status
git log --oneline --graph --decorate --all
git diff
git diff --staged
```

Para que sirven:

- `git status`: ver que esta modificado, staged o sin seguimiento.
- `git log ...`: visualizar historial y ramas.
- `git diff`: comparar cambios no staged.
- `git diff --staged`: comparar cambios ya listos para commit.

### 7.2 Trabajo con ramas

```bash
git branch
git branch -a
git checkout -b feature/xxxx-descripcion
git switch develop
git branch -d feature/xxxx-descripcion
```

Para que sirven:

- `git branch`: lista ramas locales.
- `git branch -a`: incluye remotas.
- `git checkout -b ...`: crea y cambia a nueva rama.
- `git switch develop`: cambia de rama (sintaxis moderna).
- `git branch -d ...`: borra rama local ya mergeada.

### 7.3 Trabajo con remoto

```bash
git remote -v
git fetch origin
git pull origin develop
git push
git push -u origin feature/xxxx-descripcion
```

Para que sirven:

- `remote -v`: ver origenes remotos configurados.
- `fetch`: traer referencias remotas sin mezclar.
- `pull`: traer y mezclar.
- `push`: subir commits al remoto.
- `push -u`: fijar upstream para futuros push/pull mas cortos.

### 7.4 Staging y commits

```bash
git add archivo.cs
git add .
git restore --staged archivo.cs
git commit -m "[#1234] Mensaje corto"
git commit --amend
```

Para que sirven:

- `add`: prepara cambios para commit.
- `restore --staged`: saca archivo del staging.
- `commit`: guarda snapshot en historial.
- `commit --amend`: corrige ultimo commit (usar solo si aun no se ha publicado o bajo politica acordada).

### 7.5 Deshacer cambios locales

```bash
git restore archivo.cs
git clean -fd
```

Para que sirven:

- `git restore`: descarta cambios no committeados en archivo.
- `git clean -fd`: elimina archivos/carpetas no trackeados (usar con cuidado).

### 7.6 Tags y versiones

```bash
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
git tag
```

Para que sirven:

- `tag -a`: crear etiqueta anotada para version.
- `push origin <tag>`: publicar tag en remoto.
- `git tag`: listar tags locales.

---

## 8) Merge y rebase explicados con criterio de uso

### 8.1 Merge (seguro para principiantes)

Ventajas:

- No reescribe historia.
- Menos riesgo operativo para equipos nuevos.

Ejemplo:

```bash
git checkout feature/1234-cambio
git fetch origin
git merge origin/develop
```

### 8.2 Rebase (historial mas lineal)

Ventajas:

- Historial limpio y lineal.

Riesgo:

- Reescribe commits; si ya publicaste rama, requiere coordinacion.

Ejemplo:

```bash
git checkout feature/1234-cambio
git fetch origin
git rebase origin/develop
```

Regla didactica:

- Equipo junior: priorizar merge.
- Equipo con practica: rebase permitido en ramas personales antes del PR.

---

## 9) Resolucion de conflictos (guion para clase)

Escenario tipico: dos ramas modifican la misma linea.

Pasos:

1. Ejecutar merge o rebase.
2. Git marca archivos en conflicto.
3. Abrir archivo, resolver bloques `<<<<<<<`, `=======`, `>>>>>>>`.
4. Guardar, validar build/tests.
5. Marcar resuelto y continuar.

Comandos utiles:

```bash
git status
git add archivo-en-conflicto.cs
git merge --continue
git rebase --continue
git rebase --abort
```

---

## 10) Pull Request bien hecho (checklist)

Antes de abrir PR:

- Rama correcta (`feature/*` o `bug/*`).
- Cambios acotados a una tarea concreta.
- Build/test local ejecutado.
- No incluir archivos temporales ni basura.
- Mensajes de commit entendibles.

En el PR:

- Titulo claro.
- Descripcion con contexto: problema, solucion, impacto.
- Evidencias (capturas o notas de prueba si aplica).
- Solicitar revisores adecuados (code owners entran automatico en rutas criticas).

---

## 11) Pipeline del proyecto: como funciona de extremo a extremo

### 11.1 CI (`.github/workflows/ci.yml`)

Se ejecuta en `push` y `pull_request` sobre `develop`:

- Valida enlaces Markdown.
- Restaura/compila soluciones principales.
- Ejecuta tests si existen.
- Empaqueta artefacto `drop`.

### 11.2 CD (`.github/workflows/cd.yml`)

Despliegue secuencial:

- `DEV -> PRE -> PRO`.
- Puede dispararse tras CI exitoso o manualmente con `run_id`.
- Bloquea despliegue a `PRO` desde el dia 25.
- Usa accion compuesta `deploy-dynamics`.

Orden tecnico dentro de cada entorno:

- `BL -> plugins -> actions WFA -> soluciones -> WebAPI` (+ pasos operativos BL/AIS).

### 11.3 Rollback (`.github/workflows/rollback.yml`)

- Manual.
- Inputs: `target_environment` y `run_id`.
- Restaura version anterior reutilizando el mismo orden tecnico.

---

## 12) Versionado y releases (operativa recomendada)

Estrategia SemVer:

- `MAJOR.MINOR.PATCH` (ej. `v2.3.1`).

Cuando usar:

- `MAJOR`: cambios incompatibles.
- `MINOR`: nuevas funcionalidades compatibles.
- `PATCH`: correcciones sin romper compatibilidad.

Flujo de release recomendado:

1. Crear `release/X.Y.0` desde `develop`.
2. Estabilizar y cerrar cambios.
3. PR de `release/*` a `main`.
4. Tag en `main` (`vX.Y.0`).
5. Merge de vuelta a `develop`.

Hotfix:

1. Crear `hotfix/X.Y.Z` desde `main`.
2. Corregir urgente.
3. Merge a `main`, etiquetar nueva version.
4. Merge tambien a `develop`.

---

## 13) Permisos, protecciones y ownership

Modelo base:

- Admin: configura reglas/protecciones/secrets/environments.
- Tech Leads: revisan y aprueban rutas criticas.
- Developers: trabajan en ramas y PR.
- Read: consulta.

Controles clave:

- Branch protection en `develop` y `main`.
- PR obligatorio + checks de CI.
- `Require review from Code Owners`.
- Sin force push en ramas protegidas.

`CODEOWNERS` actual del repo asigna owners por rutas (`.github`, `deploy`, `plugins`, `webresources`, `solutions`, `docs`, etc.).

---

## 14) Seguridad y buenas practicas

- No subir secretos, credenciales ni tokens.
- No commitear binarios locales innecesarios.
- Commits pequenos y con intencion clara.
- Una PR, un objetivo.
- Antes de merge: validar impacto tecnico y funcional.
- En cambios de despliegue: coordinar con runbook y ventana operativa.

---

## 15) Errores frecuentes de principiantes y como evitarlos

- Trabajar directamente en `develop`: evitarlo, crear rama siempre.
- Hacer commits enormes: dividir en partes logicas.
- Olvidar `git pull` antes de empezar: actualizar base primero.
- Resolver conflictos "a ciegas": compilar y probar siempre despues.
- Hacer push de pruebas rotas: validar localmente antes.
- No enlazar tarea/incidencia: usar prefijo `[#id]` en commit si aplica.

---

## 16) Agenda sugerida (3-4 horas)

Bloque 1 (45 min): conceptos Git + repositorio y estructura.

Bloque 2 (45 min): flujo diario con ramas, commits y PR.

Bloque 3 (45 min): merge/rebase/conflictos (demo en vivo).

Bloque 4 (30 min): CI/CD, rollback, permisos y versionado.

Bloque 5 (30-60 min): laboratorio guiado (usar documento de practica).

---

## 17) Material complementario interno

- `docs/CONTRIBUTING.md`
- `docs/GOBIERNO_REPOSITORIO.md`
- `docs/RUNBOOK_DESPLIEGUE.md`
- `docs/PROCEDIMIENTO_ROLLBACK.md`
- `docs/CODEOWNERS.md`
- `docs/GLOSARIO.md`

