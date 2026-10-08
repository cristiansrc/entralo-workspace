# Config-Help Report — JBR 25.0.3 + OpenAPI Generator CLI 7.25.0 (`config-help -g spring`)

- **Run ID (UTC):** `20261006T151425Z`
- **Tipo:** Verificación de opciones efectivas del generador **solo `config-help`**. No genera código, no valida specs, no edita contratos, no descarga ni instala nada.
- **Alcance:** una única invocación del subcomando `config-help -g spring` bajo aislamiento `unshare --user --map-root-user --net`.
- **Comando real exacto:** `provenance/config-help-jbr25-openapi-generator-spring.20261006T151425Z.command.txt`
- **No declara compatibilidad completa ni G-OAS PASS.** No modifica plan/shared/pack ni fuentes canónicas.

## 1. Runtime JDK exacto (JBR 25.0.3, nunca PATH/Java 26)

| Campo | Valor |
|---|---|
| Binario | `/home/cristiansrc/.local/share/JetBrains/Toolbox/apps/intellij-idea/jbr/bin/java` |
| `release:JAVA_VERSION` | `25.0.3` |
| `IMPLEMENTOR_VERSION` | `JBR-25.0.3+9-508.16-nomod` |
| `JAVA_RUNTIME_VERSION` | `25.0.3+9-b508.16` |
| `java -version` | `openjdk version "25.0.3" 2026-04-21` — `JBR-25.0.3+9-508.16-nomod (build 25.0.3+9-b508.16)` |
| `OS_ARCH` | `x86_64` (Linux) |

Evidencia: `config-help-jbr25-openapi-generator-spring.20261006T151425Z.version.txt`.
Confirmado: **es Java 25.0.3, no Java 26.** `java` por PATH (`/usr/bin/java` = OpenJDK 26.0.2.1) **no fue invocado**; se fijó `PATH` a solo `<JBR>/bin` y `JAVA_HOME=<JBR>`.

## 2. Artefacto bajo prueba

| Campo | Valor |
|---|---|
| Ruta | `tools/goas/vendor/tarballs/openapi-generator-cli-7.25.0.20261005T010240537579199Z-1687.jar` |
| Bytes | `31942042` |
| SHA-256 | `41ce4f6b07f196676439d710759fa1ced7a08066d06ff1bf314681470289efae` (coincide con custodia en `provenance/PROVENANCE-...-1687.md`) |

## 3. Aislamiento y enmascaramiento de rutas

- **Namespace:** `unshare --user --map-root-user --net` → `id=0:0` dentro del namespace.
- **Evidencia objetiva** (`...isolation.txt`): `userns=user:[4026533179]`, `netns=net:[4026533180]`.
- **Comparación host:** `netns` host = `net:[4026531833]` → el `netns` observado es **distinto** ⇒ la ejecución ocurrió realmente en un network namespace nuevo (sin interfaces ni egress configurados; no se configuró proxy).
- **Redirección de escritura a scratch dentro `tools/goas/.tmp/`:**

| Variable / propiedad | Valor |
|---|---|
| `HOME` | `<scratch>/home` |
| `TMPDIR` | `<scratch>/tmp` |
| `-Duser.home` | `<scratch>/home` |
| `-Djava.io.tmpdir` | `<scratch>/tmp` |

`<scratch> = tools/goas/.tmp/config-help-jbr25-openapi-generator-spring.20261006T151425Z`

## 4. Resultado de ejecución

| Campo | Valor |
|---|---|
| Exit code | **0** (`...exit.txt`) |
| STDOUT | 372 líneas / 21246 bytes; inicia con `CONFIG OPTIONS` (`...stdout.log`) |
| STDERR | **0 bytes** (`...stderr.log`, hash `e3b0c442…b855` = vacío) |
| Artefactos generados | ninguno (sin `.openapi-generator/`, sin `generated/`) |
| SHA-256 stdout | `f52db44486270f7bd744614469bb364208eb677523638542bcf7749b9701113a` |

## 5. Opciones solicitadas — existencia en `config-help -g spring 7.25.0`

Todas **existen** como opciones efectivas del generador `spring`:

| Opción | Existe | Descripción / default (literal) |
|---|---|---|
| `interfaceOnly` | **SI** | Whether to generate only API interface stubs without the server files. (Default: false) |
| `skipDefaultInterface` | **SI** | Whether to skip generation of default implementations for java8 interfaces (Default: false) |
| `useSpringBoot4` | **SI** | Spring Boot 4.x (jakarta). (Default: false); habilita `useJakartaEe` |
| `useSpringBoot3` | **SI** | Spring Boot ≥ 3 (jakarta). (Default: true); habilita `useJakartaEe` |
| `useJakartaEe` | **SI** | Usa jakarta en lugar de javax. |
| `useJackson3` | **SI** | jackson 3 (solo si `useSpringBoot4=true`). (Default: false) |
| `useBeanValidation` | **SI** | Use BeanValidation API annotations (Default: true) |
| `documentationProvider` | **SI** | Select the OpenAPI documentation provider. (Default: springdoc) |
| `useSwaggerUI` | **SI** | Open the OpenApi specification in swagger-ui. (Default: true) |
| `hideGenerationTimestamp` | **SI** | Hides the generation timestamp when files are generated. (Default: false) |

Opciones relacionadas observadas que condicionan las anteriores:
- `clientRegistrationId` requiere `library=spring-http-interface` y `useSpringBoot4=true`.
- `generatePageableConstraintValidation` y `generateSortValidation` requieren `useBeanValidation=true` y `library ∈ {spring-boot, spring-cloud}`.

## 6. Opciones de paquete / support files

**Paquete (existen):** `apiPackage` (def. `org.openapitools.api`), `modelPackage` (def. `org.openapitools.model`), `invokerPackage` (def. `org.openapitools.api`), `configPackage` (def. `org.openapitools.configuration`), `basePackage` (def. `org.openapitools`).

**Carpetas de salida / soporte (existen):** `sourceFolder`, `resourceFolder`, `testOutput`.

**No existe** una opción de configuración del generador llamada `supportingFiles`/`supportFiles` en `config-help -g spring`. La selección de archivos de soporte es una **propiedad global del CLI** (p. ej. `--global-property supportingFiles`, `--global-property apis,models,supportingFiles`), no una opción por-generador. Inventario completo: **113 opciones** (ver `...stdout.log`).

## 7. Guard de egress y de escrituras

- **Egress:** la ejecución ocurrió en un `netns` nuevo vía `unshare --net` (no solo proxy); no se configuró red ni proxy, y **no se ejecutaron sondas de red**.
- **Escrituras externas:** marcador temporal + `find -newer` sobre todo el workspace (excluyendo `.git` y el propio scratch) → **sin archivos nuevos/modificados fuera de `tools/goas/.tmp/`**. No aparecieron `.openapi-generator/` ni `generated/`.
- Los subdirectorios `<scratch>/home` y `<scratch>/tmp` quedaron vacíos ⇒ el JVM/generador no escribió preferencias ni temporales.
- **No se ejecutó limpieza externa.**

## 8. Artefactos de provenance (runid `20261006T151425Z`)

| Archivo | SHA-256 |
|---|---|
| `config-help-jbr25-openapi-generator-spring.20261006T151425Z.stdout.log` | `f52db44486270f7bd744614469bb364208eb677523638542bcf7749b9701113a` |
| `config-help-jbr25-openapi-generator-spring.20261006T151425Z.stderr.log` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (vacío) |
| `config-help-jbr25-openapi-generator-spring.20261006T151425Z.exit.txt` | `9a271f2a916b0b6ee6cecb2426f0b3206ef074578be55d9bc94f6f3fe3ab86aa` |
| `config-help-jbr25-openapi-generator-spring.20261006T151425Z.version.txt` | `39b16affb6cff51ec4632b64cab62249505a65b469ec8c7f3faf019938395545` |
| `config-help-jbr25-openapi-generator-spring.20261006T151425Z.isolation.txt` | `a2ccc3cf0291fe2776d8bea47b70ac770e4f7ecb64cc043f391c6a270a5ebee9` |
| `config-help-jbr25-openapi-generator-spring.20261006T151425Z.command.txt` | (comando real exacto) |

## 9. Límites / no ejecutado

- No se invocó `generate`, `validate`, Redocly ni Ajv.
- No se modificó plan/shared/pack ni fuentes canónicas (`docs/specs/**`, `README.md`, `package.json`, `package-lock.json`, `vendor/`, `.npmrc*`).
- Sin Git, sin escaneos de secretos, sin instalación de paquetes.
- `config-help` solo describe opciones: **no acredita** que una combinación concreta compile, genere o sea compatible con Spring Boot 4.1.1 / Jackson 3 / Java 25; eso exige los gates posteriores.

## 10. Veredicto

- `config-help -g spring` sobre OpenAPI Generator **7.25.0** ejecuta bajo **JBR 25.0.3** aislado con **exit 0**, stdout capturado y stderr vacío.
- **Las 10 opciones solicitadas existen** en el generador `spring` 7.25.0; los paquetes y carpetas de salida también. `supportingFiles` no es opción de generador (es propiedad global del CLI).
- Sin egress, sin escrituras fuera de `.tmp`, sin cambios en artefactos canónicos.
