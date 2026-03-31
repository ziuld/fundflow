# Guia de self-hosted runner

Objetivo: disponer de un runner self-hosted preparado para ejecutar los workflows de `CI`, `CD` y `Rollback` del repositorio.

Perfil destinatario: Infraestructura, DevOps y desarrolladores con permisos de administracion en GitHub y en servidores Windows.

---

## 1. Alcance

Esta guia cubre:

- Preparacion del servidor runner.
- Instalacion y registro del self-hosted runner en GitHub.
- Dependencias requeridas por el proyecto.
- Requisitos de red, permisos y secretos.
- Validacion operativa.

---

## 2. Arquitectura recomendada

- Runner dedicado por entorno sensible (`PRE`/`PRO`) o pool segmentado por etiquetas.
- Sistema operativo recomendado: **Windows Server 2019/2022** (x64).
- Ejecucion como servicio de Windows con cuenta de servicio dedicada.

Etiquetas sugeridas para enrutar jobs:

- `self-hosted`
- `windows`
- `pre` o `prod` (segun entorno)

---

## 3. Requisitos previos

### 3.1 GitHub

- Permisos para crear runners en el repositorio u organizacion.
- `Environments` creados: `dev`, `pre`, `prod`.
- Secrets/variables definidos por entorno (ver seccion 8).

### 3.2 Servidor

- CPU/RAM recomendada: 4 vCPU, 8 GB RAM (minimo).
- Disco recomendado: >= 50 GB libres.
- Hora sincronizada por NTP corporativo.
- Antivirus/EDR con exclusiones para carpeta de trabajo del runner (si politica aplica).

### 3.3 Red

- Salida HTTPS a `github.com`, `api.github.com`, `objects.githubusercontent.com`.
- Acceso a destinos internos de despliegue (shares, nodos, puertos de gestion remota).
- Resolucion DNS de nodos `PRE`/`PRO`.

---

## 4. Dependencias del runner

Instalar y validar:

- **Git for Windows** (con `git` en PATH)
- **PowerShell 7** (recomendado) y PowerShell Windows
- **.NET SDK 8.x** (para workflows actuales)
- **NuGet** / restore operativo en proyectos legacy
- (Opcional segun automatizacion real) utilidades de import Dynamics/Power Platform CLI

Comandos de validacion rapida:

```powershell
git --version
dotnet --info
pwsh --version
```

---

## 5. Crear y registrar el runner

1. En GitHub: `Repo -> Settings -> Actions -> Runners -> New self-hosted runner`.
2. Seleccionar sistema `Windows`.
3. Crear carpeta local, por ejemplo:
   - `C:\actions-runner\name-app-pre`
4. Descargar el paquete del runner desde GitHub.
5. Extraer y ejecutar configuracion:

```powershell
.\config.cmd --url https://github.com/<org>/<repo> --token <TOKEN_TEMPORAL>
```

6. Durante el asistente:
   - Nombre: `runner-name-app-pre-01` (ejemplo)
   - Runner group: segun politica org
   - Labels: `self-hosted,windows,name-app,pre`
   - Work folder: `_work`

7. Instalar como servicio:

```powershell
.\svc install
.\svc start
```

8. Verificar en GitHub que el runner aparece **Online**.

---

## 6. Cuenta de servicio y permisos

Usar cuenta dedicada (no personal), con minimo privilegio:

- Permisos de lectura/escritura donde se copian artefactos.
- Permisos de ejecucion de scripts de despliegue.
- Permisos de reinicio/operacion solo en nodos definidos.
- Sin privilegios globales innecesarios.

Recomendacion:

- Separar cuenta para `PRE` y `PRO`.
- Gestionar credenciales desde secretos, no en scripts.

---

## 7. Ajuste de workflows para self-hosted

Si se va a usar self-hosted en lugar de `windows-latest`, actualizar `runs-on`:

```yaml
runs-on: [self-hosted, windows, name-app, pre]
```

o para produccion:

```yaml
runs-on: [self-hosted, windows, name-app, prod]
```

Sugerencia: mantener CI en hosted y CD/Rollback en self-hosted si la red corporativa lo requiere.

---

## 8. Secrets y variables necesarios

Definir por environment (`dev`, `pre`, `prod`) como minimo:

- Credenciales de cuenta de servicio (usuario/password o token seguro).
- Rutas de despliegue (`DeployPath`, shares, rutas de binarios).
- Nodos destino (`WebAPINodes`, hosts de app/servicios).
- Datos de autenticacion para APIs/herramientas externas (si aplica).
- Certificados/keys (`pfx` o equivalentes) cuando corresponda.

Buenas practicas:

- Nunca persistir secretos en repositorio.
- Rotacion periodica de credenciales.
- Auditoria de accesos y cambios de secretos.

---

## 9. Validacion operativa (checklist)

- [ ] Runner aparece online en GitHub.
- [ ] `dotnet restore/build/test` ejecuta correctamente en el runner.
- [ ] Descarga de artefacto `drop` funciona desde `CD`.
- [ ] Runner alcanza nodos internos requeridos en `PRE`.
- [ ] Ejecucion de scripts PowerShell de despliegue sin errores de permisos.
- [ ] Logs y trazabilidad de ejecucion visibles en Actions.
- [ ] Prueba controlada de rollback (`rollback.yml`) usando `run_id` conocido.

---

## 10. Troubleshooting rapido

Problemas tipicos:

1. Runner offline:
   - Revisar servicio de Windows y conectividad saliente a GitHub.
2. Fallo de permisos:
   - Revisar ACL de carpetas, shares, cuenta de servicio.
3. `dotnet` no encontrado:
   - Instalar SDK y validar PATH del servicio.
4. No alcanza nodos internos:
   - Revisar firewall, rutas, DNS y proxy.
5. Fallo al descargar artefacto:
   - Verificar `run_id` y permisos del workflow/repo.

---

## 11. Seguridad y gobierno

- Aplicar aprobaciones en `Environment` para `pre/pro`.
- Limitar que runners de `prod` solo ejecuten jobs de `prod`.
- No reutilizar runners de produccion para pruebas generales.
- Mantener inventario de runners (owner, entorno, version, ultima revision).

---

## 12. Referencias

- [README del proyecto](../README.md)
- [README de automatizacion](../.github/README.md)
- [Runbook de despliegue](RUNBOOK_DESPLIEGUE.md)
- [Procedimiento de rollback](PROCEDIMIENTO_ROLLBACK.md)
