export type TFilterOption = {
  name: string;
  label: string;
  type: string;
  valueType?: string;
  dropdownOptions?: TDropdownOption[];
  placeholder?: string;
  options?: string[];
  min?: string;
  max?: string;
};

type TDropdownOption = {
  value: string;
  label: string;
};
