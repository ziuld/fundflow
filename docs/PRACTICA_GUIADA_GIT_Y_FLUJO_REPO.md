# Practica guiada: Git y flujo del repositorio

Guia de laboratorio para personas sin experiencia previa en Git.
Objetivo: practicar el flujo completo desde clonado hasta merge de PR, incluyendo conflictos, rebase y versionado.

---

## 1) Preparacion del laboratorio

Pre-requisitos:

- Git instalado.
- Acceso al repositorio en GitHub.
- Cliente de terminal (PowerShell, Git Bash o zsh).

Comprobaciones iniciales:

```bash
git --version
git config --global user.name
git config --global user.email
```

Si falta configuracion:

```bash
git config --global user.name "Nombre Apellido"
git config --global user.email "nombre@empresa.com"
```

---

## 2) Ejercicio 1 - Clonar y explorar

Objetivo: clonar el repo, ir a `develop` y reconocer estructura.

Pasos:

```bash
git clone <url-del-repo>
cd folderName
git checkout develop
git pull origin develop
```

Verificar:

```bash
git status
git branch
```

Resultado esperado:

- Estas en rama `develop`.
- Working tree limpio (`nothing to commit, working tree clean`).

---

## 3) Ejercicio 2 - Crear rama feature y primer commit

Objetivo: crear rama de trabajo y hacer un commit correcto.

Pasos:

```bash
git checkout -b feature/9999-practica-formacion
```

Crear un archivo de prueba (ejemplo):

```bash
mkdir -p entrenamiento
echo "Practica Git equipo" > entrenamiento/nota-practica.txt
```

Revisar y commitear:

```bash
git status
git add entrenamiento/nota-practica.txt
git commit -m "[#9999] Crea nota de practica para formacion Git"
```

Publicar rama:

```bash
git push -u origin feature/9999-practica-formacion
```

Resultado esperado:

- Rama publicada en remoto.
- Commit visible en `git log --oneline`.

---

## 4) Ejercicio 3 - Abrir Pull Request

Objetivo: comprender el circuito de integracion por PR.

Pasos en GitHub:

1. Abrir PR desde `feature/9999-practica-formacion` hacia `develop`.
2. Titulo sugerido: `[#9999] Practica de flujo Git para formacion`.
3. Describir que se trata de un cambio de entrenamiento.
4. Revisar checks de CI y reviewers asignados.

Verificacion:

- CI ejecutado.
- Revisores/Codeowners asignados si aplica.

---

## 5) Ejercicio 4 - Actualizar rama con cambios de develop (merge)

Objetivo: aprender sincronizacion segura para principiantes.

Simulacion: otro compañero hizo merge a `develop`.

Pasos:

```bash
git checkout feature/9999-practica-formacion
git fetch origin
git merge origin/develop
```

Si no hay conflictos:

- Se crea merge commit (o fast-forward segun caso).

Si hay conflictos:

1. Resolver manualmente.
2. Validar archivo final.
3. Ejecutar:

```bash
git add <archivo-resuelto>
git commit
git push
```

---

## 6) Ejercicio 5 - Actualizar rama con rebase (avanzado)

Objetivo: practicar historial lineal.

Pasos:

```bash
git checkout feature/9999-practica-formacion
git fetch origin
git rebase origin/develop
```

Si hay conflictos:

```bash
git add <archivo-resuelto>
git rebase --continue
```

Abortar si algo sale mal:

```bash
git rebase --abort
```

Importante:

- Si el rebase reescribe commits ya publicados, puede requerir `git push --force-with-lease` (solo si el equipo lo permite y en ramas personales de feature).

---

## 7) Ejercicio 6 - Resolver conflicto controlado

Objetivo: entender conflictos sin riesgo productivo.

Preparacion recomendada por formador:

1. Dos ramas de practica modifican la misma linea en un archivo de prueba.
2. Merge de una rama a `develop`.
3. En la otra rama, ejecutar merge/rebase con `develop`.

Pasos de resolucion:

```bash
git status
# editar archivo y resolver marcadores
git add <archivo>
git merge --continue
```

Para rebase:

```bash
git rebase --continue
```

Criterio de aprobacion:

- El participante explica que partes conserva y por que.

---

## 8) Ejercicio 7 - Etiquetar version (simulado)

Objetivo: aprender versionado con tags.

Pasos (simulados en rama local o entorno de entrenamiento):

```bash
git checkout main
git pull origin main
git tag -a v0.0.1-formacion -m "Version de practica formativa"
git tag
```

Publicar tag (solo si se autoriza para laboratorio):

```bash
git push origin v0.0.1-formacion
```

---

## 9) Ejercicio 8 - Flujo release y hotfix (simulado)

Objetivo: internalizar rutas de ramas de version.

Release:

```bash
git checkout develop
git pull origin develop
git checkout -b release/2.1.0
```

Despues de estabilizar:

- PR `release/2.1.0 -> main`
- Tag `v2.1.0`
- PR de vuelta `release/2.1.0 -> develop`

Hotfix:

```bash
git checkout main
git pull origin main
git checkout -b hotfix/2.1.1
```

Despues:

- PR `hotfix/2.1.1 -> main` + tag `v2.1.1`
- PR `hotfix/2.1.1 -> develop`

---

## 10) Ejercicio 9 - Lectura operativa de pipeline

Objetivo: que el equipo entienda que ocurre tras el merge.

Actividad:

1. Abrir Actions en GitHub.
2. Identificar ejecucion de `CI`.
3. Identificar promocion `CD` (`DEV -> PRE -> PRO`).
4. Identificar gate de dia 25 para `PRO`.
5. Revisar que rollback es manual con `target_environment` y `run_id`.

Preguntas de validacion:

- Que artefacto usa CD? (`drop`).
- Que input es obligatorio en CD manual? (`run_id`).
- Cuando se bloquea PRO? (desde dia 25).

---

## 11) Ejercicio 10 - Permisos y governance

Objetivo: comprender por que no hay push directo a ramas protegidas.

Actividad:

1. Revisar `docs/GOBIERNO_REPOSITORIO.md`.
2. Revisar `.github/CODEOWNERS`.
3. Identificar owners de:
   - `.github/`
   - `deploy/`
   - `plugins/LMS.CRM/`
   - `webresources/`

Resultado esperado:

- Participante entiende que las aprobaciones dependen de la ruta modificada.

---

## 12) Comandos de apoyo para incidencias comunes

Ver ultimo historial:

```bash
git log --oneline -20
```

Sacar un archivo del staging:

```bash
git restore --staged <archivo>
```

Descartar cambios locales en un archivo:

```bash
git restore <archivo>
```

Eliminar archivos no trackeados:

```bash
git clean -fd
```

Ver diferencias:

```bash
git diff
git diff --staged
```

---

## 13) Rubrica de evaluacion del taller

Cada participante aprueba si puede:

- Clonar, crear rama y hacer commit con mensaje correcto.
- Publicar rama y abrir PR a `develop`.
- Sincronizar su rama con `develop` por merge.
- Explicar diferencia entre merge y rebase.
- Resolver un conflicto simple guiado.
- Explicar de forma basica CI, CD, rollback, tags y governance.

---

## 14) Cierre de la practica

Limpieza sugerida (si rama de practica ya no se usa):

```bash
git checkout develop
git pull origin develop
git branch -d feature/9999-practica-formacion
git push origin --delete feature/9999-practica-formacion
```

Material de apoyo:

- `docs/GUIA_FORMACION_GIT_Y_OPERACION_REPO.md`
- `docs/CONTRIBUTING.md`
- `docs/GOBIERNO_REPOSITORIO.md`
- `docs/RUNBOOK_DESPLIEGUE.md`
- `docs/PROCEDIMIENTO_ROLLBACK.md`

