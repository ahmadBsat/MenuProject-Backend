export const validationCustomMessage = (label: string, customMessage?: any) => {
  const lowerLabel = label?.toLowerCase();

  let rulesMessage = {
    "any.required": `Please enter a valid ${lowerLabel}.`,
    "string.empty": `Please enter ${lowerLabel}.`,
    "string.alphanum": `Please enter only characters in ${lowerLabel}`,
    "string.min": `${label} should have a minimum length of {#limit}`,
    "string.max": `${label} should have a maximum length of {#limit}`,
    "string.base": `${label} must be a string.`,
    "string.email": `Please enter valid ${lowerLabel}.`,
    "string.pattern.base": `Please enter valid ${lowerLabel}.`,
    "object.unknown": `${label} is not allowed.`,
    "any.only": `Please enter valid ${lowerLabel}.`,
    "number.base": `${label} must be a number.`,
    "object.base": `${label} must be a object.`,
    "boolean.base": `${label} must be a boolean.`,
    "array.unique": `${label} contains a duplicate value.`,
  };

  if (customMessage && typeof customMessage === "object") {
    rulesMessage = {
      ...rulesMessage,
      ...customMessage,
    };
  }
  return rulesMessage;
};

export const validationErrorMessage = (error: any) => {
  const [first] = error?.details?.map((i: any) => i?.message);
  return first;
};

export const validateSchema = (schema: any, params: any) => {
  let { error } = schema.validate(params);
  const { value } = schema.validate(params);

  if (error) {
    error = validationErrorMessage(error);
  }

  return {
    value,
    error,
  };
};
