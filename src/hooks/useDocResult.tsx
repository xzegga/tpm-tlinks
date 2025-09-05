import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { BiText } from "react-icons/bi";
import { FaBookOpen } from "react-icons/fa";
import { MdStyle } from "react-icons/md";
import { GiBrain } from "react-icons/gi";
import { Document, DocumentObject, ResultDoc } from "../models/document";

export const useDocResult = () => {
   const getDocTypeInfo = (doc: Document): { typeLabel: string; icon: JSX.Element } | null => {
      if (doc.isCertificate) {
         return { typeLabel: "Certificate", icon: <AiOutlineSafetyCertificate fontSize={28} color="green" /> };
      }
      if (doc.isBittext) {
         return { typeLabel: "Bittext", icon: <BiText fontSize={28} color="blue" /> };
      }
      if (doc.isGlossary) {
         return { typeLabel: "Glossary", icon: <FaBookOpen fontSize={28} color="orange" /> };
      }
      if (doc.isStyleSheet) {
         return { typeLabel: "StyleSheet", icon: <MdStyle fontSize={28} color="purple" /> };
      }
      if (doc.isMemory) {
         return { typeLabel: "Memory", icon: <GiBrain fontSize={28} color="red" /> };
      }
      return null;
   };

   const buildResultDocs = (docs: DocumentObject[]): ResultDoc[] => {
      return docs
         .map((doc) => {
            const info = getDocTypeInfo(doc.data);
            if (!info) return null; // si no aplica, descartamos
            return {
               id: doc.id,
               name: doc.data.name,
               data: doc.data,
               typeLabel: info.typeLabel,
               icon: info.icon,
            };
         })
         .filter((item): item is ResultDoc => item !== null);
   };

   return {
      getDocTypeInfo,
      buildResultDocs
   }
}
