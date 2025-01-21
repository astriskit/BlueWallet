/**
 * if address is missing and `script.hex` is set - this is a custom script (like OP_RETURN)
 */
export type CreateTransactionTarget = {
  address?: string;
  value?: number;
  script?: {
    length?: number; // either length or hex should be present
    hex?: string;
  };
};
