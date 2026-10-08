# Smoke Report — JBR 25.0.3 + OpenAPI Generator CLI (solo `version`)

- **Run ID (UTC):** 20261006T135704Z
- **Tipo:** Smoke check de compatibilidad **solo-runtime** (no genera artefactos, no consulta red).
- **Alcance:** Ejecución autorizada por mandate "hasta Validator". **No declara compatibilidad completa ni G-OAS PASS.**

## 1. Comando ejecutado (redactado)

```
# Home enmascarado: /home/<user>
# Egress bloqueado vía proxy a puerto cerrado local (no altera args de java)
http_proxy=http://127.0.0.1:9 https_proxy=http://127.0.0.1:9 \
HTTP_PROXY=http://127.0.0.1:9 HTTPS_PROXY=http://127.0.0.1:9 \
ALL_PROXY=http://127.0.0.1:9 no_proxy= NO_PROXY= \
/home/<user>/.local/share/JetBrains/Toolbox/apps/intellij-idea/jbr/bin/java \
  -jar tools/goas/vendor/tarballs/openapi-generator-cli-7.25.0.20261005T010240537579199Z-1687.jar \
  version
```

- Runtime usado: **JBR 25.0.3 de IntelliJ Toolbox** (ruta explícita, nunca `java` por PATH).
- `java` por PATH (`/usr/bin/java` = OpenJDK **26.0.2.1**) **no fue usado**.
- No se usó `--help` (evita disparo de plugin/red). Único argumento: `version`.

## 2. Runtime JDK exacto

| Campo | Valor |
|---|---|
| Binario | `~/.local/share/JetBrains/Toolbox/apps/intellij-idea/jbr/bin/java` |
| `JAVA_VERSION` (release) | `25.0.3` |
| `IMPLEMENTOR_VERSION` | `JBR-25.0.3+9-508.16-nomod` |
| `JAVA_RUNTIME_VERSION` | `25.0.3+9-b508.16` |
| `java -version` | `openjdk version "25.0.3" 2026-04-21` — `JBR-25.0.3+9-508.16-nomod (build 25.0.3+9-b508.16)` |
| `OS_ARCH` | `x86_64` (Linux) |

Confirmado: **es Java 25, no Java 26.** No se modificó el JDK de sistema ni el JBR; no se instaló Java.

## 3. Artefacto bajo prueba

| Campo | Valor |
|---|---|
| Ruta | `tools/goas/vendor/tarballs/openapi-generator-cli-7.25.0.20261005T010240537579199Z-1687.jar` |
| Tamaño | `31942042` bytes |
| SHA-256 | `41ce4f6b07f196676439d710759fa1ced7a08066d06ff1bf314681470289efae` |

## 4. Resultado

| Campo | Valor |
|---|---|
| Exit code | **0** |
| STDOUT | `7.25.0` |
| STDERR | *(vacío, 0 bytes)* |
| Procesos residuales | ninguno |
| Artefactos generados | ninguno (sin `.openapi-generator/`, sin `generated/`) |

## 5. Postura de red y aislamiento

- **Egress:** bloqueado/offline — proxy env a `127.0.0.1:9` (puerto cerrado local).
- **Sin red / sin callbacks / sin egress** durante el smoke.
- **Sin JS packages** instalados ni ejecutados (no `npm install`, `ignore-scripts=true` intacto).
- **Node install status:** verificado localmente — **no necesario** para este smoke. Node v26.7.0 (mise) está presente pero no fue invocado.
- **Sin Git / sin secret-scan** en esta ejecución.
- **Sin lint / generate / OpenAPI.**

## 6. Escrituras

- Únicamente dentro de `tools/goas/provenance/`:
  - `smoke-jbr25-openapi-generator-version.20261006T135704Z.log` (stdout crudo)
  - `smoke-jbr25-openapi-generator-version.20261006T135704Z.stderr.log` (stderr crudo)
  - este reporte.
- No se escribió nada fuera de `tools/goas/provenance/`.

## 7. Veredicto

- El JAR staged **arranca** y responde al subcomando `version` bajo JBR 25.0.3 con exit 0.
- **No se declara compatibilidad completa ni G-OAS PASS.** Este documento cubre exclusivamente el smoke de compatibilidad runtime.
