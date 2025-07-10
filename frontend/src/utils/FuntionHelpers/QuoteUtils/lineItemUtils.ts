import { DiscountType } from '../../../constants/Enumeration/CommonEnum/DiscountEnum';
import { TAddLineItem, TUpdateLineItem } from '../../../types/LineItem';
import { TAddQuote, TUpdateQuote } from '../../../types/Quote';
import { TServiceItem } from '../../../types/ServiceItem';

// Shared types for line item operations
export type LineItemOperationProps = {
  quote: TAddQuote | TUpdateQuote;
  index: number;
  setQuote: React.Dispatch<React.SetStateAction<any>>;
};

// Shared functions
export const selectServiceItem = (
  props: LineItemOperationProps,
  serviceItem: TServiceItem,
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>,
  setActiveSearchIndex: React.Dispatch<React.SetStateAction<number | null>>
) => {
  const { quote, index, setQuote } = props;

  setQuote((prev: any) => {
    const newLineItems = [...prev.lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      serviceItemId: serviceItem.id,
      name: serviceItem.name,
      description: serviceItem.description,
      unitPrice: serviceItem.unitPrice,
      isTaxable: serviceItem.isTaxable,
      taxRate: serviceItem.taxRate,
    };
    return { ...prev, lineItems: newLineItems };
  });
  setSearchTerm('');
  setActiveSearchIndex(null);
};

export const handleLineItemChange = (
  props: LineItemOperationProps,
  field: keyof (TAddLineItem & TUpdateLineItem),
  value: any
) => {
  const { quote, index, setQuote } = props;

  setQuote((prev: any) => {
    const newLineItems = [...prev.lineItems];
    const updatedItem = { ...newLineItems[index] };

    if (
      (field === 'name' &&
        updatedItem.serviceItemId &&
        value !== updatedItem.name) ||
      (field === 'unitPrice' &&
        updatedItem.serviceItemId &&
        value !== updatedItem.unitPrice)
    ) {
      updatedItem.serviceItemId = undefined;
    }

    updatedItem[field] = value;
    newLineItems[index] = updatedItem;

    return { ...prev, lineItems: newLineItems };
  });
};

export const addNewLineItem = (
  setQuote: React.Dispatch<React.SetStateAction<any>>
) => {
  setQuote((prev: any) => ({
    ...prev,
    lineItems: [
      ...prev.lineItems,
      {
        quantity: 1,
        name: '',
        unitPrice: 0,
        description: '',
      },
    ],
  }));
};

export const removeLineItem = (props: LineItemOperationProps) => {
  const { quote, index, setQuote } = props;

  setQuote((prev: any) => ({
    ...prev,
    lineItems: prev.lineItems.filter((_: any, i: number) => i !== index),
  }));
};

export const calculateQuoteTotals = (quote: TAddQuote | TUpdateQuote) => {
  const subtotal = quote.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const discountAmount =
    quote.discountType === DiscountType.Percentage
      ? subtotal * (quote.discountValue / 100)
      : quote.discountValue;
  const taxAmount = (subtotal - discountAmount) * (quote.taxRate / 100);
  const total = subtotal - discountAmount + taxAmount;

  return { subtotal, discountAmount, taxAmount, total };
};
