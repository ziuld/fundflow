# Guia de GitHub-hosted runners (estandar) para legalitas-crm

Objetivo: usar runners gestionados por GitHub para ejecutar workflows de `CI` y, cuando sea viable, parte de `CD`.

Perfil destinatario: Devs, DevOps y responsables de plataforma GitHub.

---

## 1. Que son y cuando usarlos

Los GitHub-hosted runners son maquinas efimeras gestionadas por GitHub (por ejemplo `windows-latest`, `ubuntu-latest`).

Recomendado para:

- `CI` (build, test, validaciones de docs y empaquetado).
- `CD` solo si el despliegue no depende de red privada corporativa.

No recomendado para:

- Despliegues que requieran acceso a nodos internos no expuestos.
- Operaciones con dependencias on-prem aisladas sin conectividad saliente/entrante adecuada.

---

## 2. Requisitos de plataforma

### 2.1 GitHub

- Actions habilitado en repo/organizacion.
- Environments creados: `dev`, `pre`, `prod`.
- Secrets/variables por entorno definidos.

### 2.2 Facturacion/cuotas

- Verificar minutos disponibles de Actions (plan org/repo).
- Estimar consumo de `windows-latest` (suele ser mas costoso que Linux).

---

## 3. Configuracion base en workflows

### 3.1 CI en hosted (recomendado)

Ejemplo:

```yaml
runs-on: windows-latest
```

### 3.2 CD en hosted (solo si red lo permite)

Ejemplo:

```yaml
runs-on: windows-latest
```

Si PRE/PRO estan en red privada sin exposicion, usar self-hosted para CD.

---

## 4. Dependencias en hosted runners

Los hosted runners traen utilidades preinstaladas, pero no asumas versiones fijas.

Recomendaciones:

- Fijar version de .NET con `actions/setup-dotnet`.
- Declarar dependencias en workflow (no confiar solo en imagen base).
- Evitar dependencias no versionadas en scripts.

Validaciones utiles:

```powershell
dotnet --info
git --version
pwsh --version
```

---

## 5. Secrets y variables

Definir en GitHub (`Repository secrets` o `Environment secrets`):

- Credenciales de despliegue.
- Rutas y nodos por entorno.
- Tokens/API keys necesarias.
- Certificados o material criptografico cuando aplique.

Buenas practicas:

- Secrets en `Environment` para separar `pre` y `prod`.
- Rotacion periodica.
- Nunca almacenar secretos en el repo.

---

## 6. Limitaciones clave de hosted runners

1. No acceso garantizado a red privada corporativa.
2. IP saliente dinamica (si hay listas blancas estrictas, complica integraciones).
3. Entorno efimero: no persiste estado entre jobs.
4. Restricciones de tiempo/recursos segun plan de GitHub.

Para este proyecto:

- CI: adecuado en hosted.
- CD PRE/PRO: evaluar conectividad real; si no hay acceso interno, migrar CD a self-hosted.

---

## 7. Patron recomendado para legalitas-crm

- Mantener `CI` en `windows-latest`.
- Mantener validaciones de docs en Linux (`ubuntu-latest`) para optimizar coste.
- Ejecutar `CD` y `Rollback` en:
  - hosted si hay conectividad a destinos, o
  - self-hosted segmentado por entorno si no la hay.

---

## 8. Checklist de validacion

- [ ] `CI` en verde en `windows-latest`.
- [ ] Artefacto `drop` generado y consumible.
- [ ] `CD` puede descargar artefacto con `run_id`.
- [ ] Si `CD` usa hosted: reachability a nodos PRE/PRO verificada.
- [ ] `Rollback` funcional con `run_id` conocido.
- [ ] Environment approvals y branch protections activas.

---

## 9. Troubleshooting rapido

Problemas comunes:

1. Falla de version de SDK:
   - Fijar version exacta con `setup-dotnet`.
2. Error de permisos en secretos:
   - Revisar si estan en repo vs environment correcto.
3. Falla de conectividad en CD:
   - Confirmar si hosted tiene acceso real a red destino.
4. Timeouts:
   - Optimizar jobs o dividir pipelines por etapas.

---

## 10. Referencias

- [README de automatizacion](../.github/README.md)
- [Runbook de despliegue](RUNBOOK_DESPLIEGUE.md)
- [Procedimiento de rollback](PROCEDIMIENTO_ROLLBACK.md)
- [Guia de self-hosted runner](SELF_HOSTED_RUNNER_GUIA.md)
