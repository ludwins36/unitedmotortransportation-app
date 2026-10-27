import { AlertButton, Platform, Alert as RNAlert } from "react-native";

export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { cancelable?: boolean; onDismiss?: () => void },
  ) => {
    if (Platform.OS === "web") {
      // Si no hay botones, es una alerta simple
      if (!buttons || buttons.length === 0) {
        window.alert(`${title}\n\n${message || ""}`);
        return;
      }

      // En web, window.confirm solo soporta OK/Cancel (true/false)
      // Si hay más de 2 opciones o son opciones complejas, no se puede mapear perfectamente a window.confirm
      // Para casos simples (Aceptar/Cancelar), window.confirm funciona.

      // Buscamos si hay un botón con estilo 'cancel' o que parezca cancelar
      const cancelButton = buttons.find(
        (b) => b.style === "cancel" || b.text?.toLowerCase().includes("cancel"),
      );
      const confirmButton = buttons.find((b) => b !== cancelButton);

      // Si es un confirm simple (2 botones)
      if (buttons.length <= 2) {
        const result = window.confirm(`${title}\n\n${message || ""}`);
        if (result) {
          confirmButton?.onPress?.();
        } else {
          cancelButton?.onPress?.();
        }
      } else {
        // Fallback para múltiples opciones en web (como Cámara/Galería)
        // Como window.confirm no soporta 3 opciones, usamos window.prompt o simplemente ejecutamos la acción por defecto para web si se puede inferir,
        // o mostramos una alerta indicando que la funcionalidad es limitada.
        // En el caso específico de ImagePicker, ya lo manejamos con un early return en request.tsx.
        // Pero para una solución general, podriamos usar un confirm simple o logs.
        console.warn(
          "Alert con múltiples opciones no es totalmente soportado en Web nativo. Usando confirm básico.",
        );
        // Intentamos mostrar las opciones como texto para que el usuario sepa, aunque solo pueda aceptar/cancelar
        const optionsText = buttons.map((b) => `[${b.text}]`).join(" ");
        const result = window.confirm(
          `${title}\n\n${message || ""}\n\nOpciones: ${optionsText}\n(Aceptar para la primera opción, Cancelar para salir)`,
        );

        if (result && buttons.length > 0) {
          // Ejecutamos la primera opción que no sea cancelar como 'default'
          const defaultAction = buttons.find((b) => b.style !== "cancel");
          defaultAction?.onPress?.();
        } else {
          cancelButton?.onPress?.();
        }
      }
    } else {
      // En móvil usamos el Alert nativo
      RNAlert.alert(title, message, buttons, options);
    }
  },
};
