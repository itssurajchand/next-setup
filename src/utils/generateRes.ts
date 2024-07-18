export type IGenerateResFn = {
  status: boolean;
  message?: string | null;
  data?: any;
};

/**
 * @param args IGenerateResFn
 * @returns Response obj, created using given args
 */

const generateRes = (args: IGenerateResFn) => {
  const { status, message = null, data = null } = args;
  return {
    status,
    message,
    data,
  };
};

export { generateRes };
