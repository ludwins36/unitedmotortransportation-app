# Publicar en Google Play (Android)

Guía para **United Motor Transportation** con **Expo EAS**. De momento la publicación prevista es solo Android.

## Requisitos

- Cuenta de **desarrollador de Google Play** (cuota única).
- Proyecto en **EAS** (`eas login`, `eas whoami`).
- **`google-services.json`** en la raíz (Firebase) — ya referenciado en `app.json` como `android.googleServicesFile`.

## 1. Google Play Console

1. Crea la aplicación en [Play Console](https://play.google.com/console).
2. **Nombre del paquete** debe coincidir con `app.json` → `android.package`:  
   `com.honduespacios.unitedmotortransportation`
3. Completa la **ficha de la tienda**: descripción, capturas (teléfono y si aplica tablet), icono 512×512 y **gráfico de funciones** (ver abajo).
4. **Política de privacidad**: URL pública (puedes basarte en `docs/politica-privacidad.md`).
5. **Cuestionario de seguridad de datos** (Data safety): alinea las respuestas con lo que hace la app (login, fotos, notificaciones, etc.).

### Gráfico de funciones (feature graphic)

Es el **banner horizontal** que aparece arriba en la ficha de Google Play (no confundir con el icono 512×512).

| Requisito | Valor habitual |
|-----------|----------------|
| Tamaño | **1024 × 500 px** (proporción ~2:1) |
| Formato | PNG o JPEG, hasta **15 MB** |
| Contenido | Marca, nombre de la app y mensaje breve; evita amontonar texto ilegible en móvil |

**Cómo crearlo**

1. **Plantilla fija:** crea un lienzo **1024 × 500** en Canva, Figma, Photoshop o Photopea (gratis).
2. **Marca:** usa el color principal de la app (**#FBB000**) y, si quieres, el logo o icono desde `assets/images/` (por ejemplo `Icono-United-Motors.png`).
3. **Texto:** una línea corta (nombre + eslogan); fuente grande y contraste alto para que se lea en miniatura.
4. **Exportar:** PNG o JPG a tamaño exacto; súbelo en Play Console → **Ficha de la tienda** → **Gráfico de funciones**.

Las reglas exactas pueden actualizarse; conviene revisar [Requisitos de recursos gráficos](https://support.google.com/googleplay/android-developer/answer/9866151) en la ayuda de Google Play.

## 2. Build de producción (AAB)

Google Play exige **Android App Bundle** (`.aab`). EAS lo genera por defecto en builds de producción.

```bash
eas build --platform android --profile production
```

No es necesario confirmar ni configurar variables de entorno (`.env`, EAS Secrets) **antes** de este comando: el build en la nube usa el repositorio y `app.json`; las `EXPO_PUBLIC_*` opcionales ya tienen valores por defecto en código si no las defines.

- `version` en `app.json` es la versión visible (`1.0.0`).
- `versionCode` en `android` se incrementa con `autoIncrement` en `eas.json` en builds de producción (requerido para cada subida nueva).

## 3. Subir a Play Console

### Opción A: EAS Submit (recomendado)

1. En Play Console → **Configuración** → **Acceso a la API**: crea una cuenta de servicio y descarga el JSON de credenciales.
2. Sube la clave a EAS de forma segura y configura submit, o usa:

```bash
eas submit --platform android --latest
```

Sigue el asistente; si pide el JSON de la cuenta de servicio, indica la ruta al archivo (no lo subas al repositorio).

### Opción B: Manual

Descarga el `.aab` desde el panel de EAS y súbelo en Play Console → **Producción** (o prueba interna/cerrada primero).

## 4. Checklist rápido

- [ ] `eas build --platform android --profile production` completado sin errores.
- [ ] Misma firma en actualizaciones futuras (EAS gestiona el keystore si usas sus credenciales).
- [ ] Primera revisión: suele tardar horas o días; resuelve avisos de política si los hay.

Documentación Expo: [Submit to the Google Play Store](https://docs.expo.dev/submit/android/).
