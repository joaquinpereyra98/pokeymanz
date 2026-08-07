import "./actor/_types";
import "./mixins/_types";

export interface DocumentSheetMetadata {
  label: string;
  types: string[];
  isDefault: boolean;
  register: boolean;
}
