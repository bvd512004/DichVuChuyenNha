// src/utils/pdfFonts.jsx
import { useEffect } from "react";
import pdfMake from "pdfmake/build/pdfmake";

const PdfFontsProvider = () => {
  useEffect(() => {
    if (!pdfMake.vfs) {
      import("pdfmake/build/vfs_fonts").then((vfs) => {
        // SỬA: vfs.pdfMake.vfs (không có .default)
        pdfMake.vfs = vfs.pdfMake.vfs;

        pdfMake.fonts = {
          Roboto: {
            normal: "Roboto-Regular.ttf",
            bold: "Roboto-Bold.ttf",
          },
        };
      });
    }
  }, []);

  return null;
};

export default PdfFontsProvider;