const isEnterPressed = (event: any) => {
  return event?.key === "Enter" || event?.keyCode === 13;
};

const isWindowPresent = () => {
  return typeof window !== "undefined";
};

const dom = {
  isEnterPressed,
  isWindowPresent,
};

export { dom };
