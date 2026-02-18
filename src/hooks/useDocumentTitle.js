import { useEffect } from "react";

/**
 * Sayfa başlığını dinamik olarak ayarlayan hook
 * @param {string} title - Sayfa başlığı (opsiyonel, verilmezse sadece "solution1 Admin" kullanılır)
 */
export const useDocumentTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} - solution1 Admin` : "solution1 Admin";
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
