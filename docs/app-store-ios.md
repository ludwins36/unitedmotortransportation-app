# Publicar en App Store (iOS)

**Nota:** la publicación prevista por ahora es solo **Android**; usa `docs/play-store-android.md`. Conserva esta guía para cuando publiques en iOS.

Guía para **United Motor Transportation** (Expo + EAS). El `bundleIdentifier` de iOS debe coincidir con el de `app.json`: `com.honduespacios.unitedmotortransportation`.

## 1. Requisitos previos

- Cuenta **Apple Developer Program** (suscripción anual).
- Cuenta **Expo** y proyecto enlazado (`eas login`, `eas project:init` si aplica).
- Archivo **`GoogleService-Info.plist`**: en [Firebase Console](https://console.firebase.google.com) crea la app **iOS** con el mismo bundle ID y descarga el plist; colócalo en la **raíz del repo** con ese nombre (coincide con `ios.googleServicesFile` en `app.json`).

## 2. Apple Developer y App Store Connect

1. En [developer.apple.com](https://developer.apple.com): **Identifiers** → App ID con **Explicit** bundle ID `com.honduespacios.unitedmotortransportation`.
2. Activa capacidades que uses: **Push Notifications** (Firebase Cloud Messaging en iOS requiere APNs).
3. En [App Store Connect](https://appstoreconnect.apple.com): **My Apps** → **+** → nueva app (plataforma iOS, bundle ID anterior).
4. Configura **App Privacy** (datos que recopilas; alinea con `docs/politica-privacidad.md`).
5. **Export compliance**: en `app.json` está `ITSAppUsesNonExemptEncryption: false` (solo HTTPS estándar). Si Apple pregunta, indica que no usas cifrado no exento (o según tu caso real).

## 3. APNs y Firebase (notificaciones)

- En Apple Developer: crea una **Key** de **Apple Push Notifications service (APNs)** y súbela en la consola de Firebase (Project settings → Cloud Messaging → iOS).
- Sin esto, las notificaciones push en iOS pueden no funcionar aunque Android sí.

## 4. Build con EAS

```bash
eas build --platform ios --profile production
```

- La primera vez, EAS pedirá credenciales/certificados (puedes dejar que EAS los genere y gestione).
- `autoIncrement` en `eas.json` incrementa el build de iOS en builds de producción.

## 5. Enviar a App Store Connect

```bash
eas submit --platform ios --latest
```

O configura `submit.production` en `eas.json` con `appleId`, `ascAppId` y `appleTeamId` (sin commitear secretos; usa variables de entorno o `eas secret` según la documentación de EAS).

## 6. Metadatos y revisión

- **Capturas**: tamaños requeridos por Apple para iPhone (y iPad si `supportsTablet: true`).
- **Texto promocional**, descripción, palabras clave, categoría, URL de soporte y **URL de política de privacidad** (pública).
- **Versión**: `expo.version` en `app.json`; el **build** lo gestiona EAS / `ios.buildNumber`.

## 7. Checklist rápido

- [ ] `GoogleService-Info.plist` en la raíz del proyecto.
- [ ] App creada en App Store Connect con el bundle ID correcto.
- [ ] Política de privacidad publicada y enlazada.
- [ ] Permisos justificados (cámara/galería vía plugin `expo-image-picker`; fondo `remote-notification` si usas push).
- [ ] `eas build --platform ios --profile production` exitoso.
- [ ] `eas submit` y estado **Waiting for Review** / aprobado.

Para dudas de Expo: [Submit to the Apple App Store](https://docs.expo.dev/submit/ios/).
