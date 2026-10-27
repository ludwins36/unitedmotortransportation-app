import { useState } from "react";

export type AlertType = "error" | "success" | "info";

export interface AlertModalConfig {
  title: string;
  message: string;
  type: AlertType;
}

export function useAlertModal() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<AlertModalConfig>({
    title: "",
    message: "",
    type: "info",
  });

  const showModal = (
    title: string,
    message: string,
    type: AlertType = "info",
  ) => {
    setModalConfig({ title, message, type });
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  return {
    modalVisible,
    modalConfig,
    showModal,
    hideModal,
  };
}
