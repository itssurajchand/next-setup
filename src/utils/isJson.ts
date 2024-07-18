const isJson = (json: any) => {
  try {
    JSON.parse(json);
    return true;
  } catch (error) {
    return false;
  }
};

export { isJson };