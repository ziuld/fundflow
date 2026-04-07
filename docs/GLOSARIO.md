# Glosario – Proyecto GIT MVP Dynamics Legálitas

Definición de términos usados en la documentación del repositorio para unificar lenguaje y facilitar onboarding.

---

## A

**AIS**  
Mecanismo de publicación de **endpoints** en Dynamics. La publicación se realiza desde **Visual Studio** con perfil de publicación por rama/entorno. En **PRO** solo el **Tech Lead** puede publicar. Puede ser paso aparte del pipeline o integrarse en él.

**Artefacto (versionado)**  
Resultado del build (paquetes NuGet, zips de soluciones, DLL) identificado por **versión**. El mismo artefacto (misma versión) se promociona de DEV a PRE y de PRE a PRO; no se recompila por entorno.

---

## B

**BL / LMS.CRM.BL (BL)**  
Librería **core transversal** del CRM. Se despliega en la **GAC**. Al publicar cambios pueden caer servicios; es el componente más sensible. Orden de despliegue: BL antes que plugins que dependen de ella. Se versiona como artefacto y se despliega en orden controlado por el pipeline.

**Build único**  
Compilación realizada en servidor (pipeline CI), no en la máquina del desarrollador. Genera artefactos reproducibles y versionados.

---

## C

**Codeowners**  
Fichero (`.github/CODEOWNERS`) que asigna **revisores por ruta**. Tech Lead por grupo funcional (Finanzas, Operaciones) para BL/IBL y plugins críticos. Todo cambio en esas rutas requiere su revisión antes del merge.

---

## D

**Develop**  
Rama principal de avance integrado. Solo acepta cambios vía **PR** aprobado; no hay push directo. El pipeline CI se dispara al actualizar develop.

---

## E

**Entornos**  
**DEV** (desarrollo), **PRE** (preproducción), **PRO** (producción). DEV y PRE “llevan su propia vida”.

---

## G

**Gitflow (híbrido)**  
Ramas: **main** (producción), **develop** (avance integrado), **feature/xxx**, **bug/xxx**, **release/X.Y.0**, **hotfix/X.Y.Z**. No hay commit directo en main ni en develop; todo entra vía PR o merge de release/hotfix.

---

## M

**Main**  
Rama que representa el código en **producción**. Solo acepta merge desde **release/** o **hotfix/**; no push directo.

---

## P

**Pipeline CI**  
Al actualizar **develop**: checkout, restore, build de plugins, empaquetado de soluciones, tests (si existen) y **publicación de artefactos versionados**.

**Pipeline CD**  
Toma los artefactos del CI y despliega en orden a **DEV**, luego **PRE**, luego **PRO** (en ventana acordada, fuera del día 25). Incluye opción de rollback.

**PRE**  
Preproducción. Pruebas técnicas se realizan en PRE. Siempre se pasa por PRE antes de PRO (salvo hotfix).

**PRO**  
Producción. **Restricción:** no tocar PRO a partir del **25** de cada mes. Ventana de referencia: 21:00–23:00.

**Pull Request (PR)**  
Obligatorios para integrar cambios en **develop**. Todo cambio pasa por revisión (Codeowners o revisores asignados) antes del merge.

---

## R

**Registry (de artefactos)**  
Almacén de artefactos versionados (NuGet privado, GitHub Packages o interno) donde el pipeline CI publica y el CD descarga la versión a desplegar.

**Rollback**  
Revertir desplegando la **versión anterior** desde artefactos, en el mismo orden que el despliegue. Objetivo: rollbacks **ágiles**.

---

## T

**Tech Lead (por grupo funcional)**  
Revisores en CODEOWNERS: Tech Lead **Finanzas** y Tech Lead **Operaciones** para cambios en BL/IBL y plugins críticos.

---

## W

**Webresources**  
Recursos web (JavaScript, HTML, CSS, imágenes). En repo y en pipeline; cambios vía PR.

