import React from "react";
import clsx from "clsx";
import primaryColorConfig from '@configs/primaryColorConfig'

type ILoaderWithPageLoader = {
    isPageLoader: boolean;
    detached: boolean;
    loaderColor?: string;
};

type ILoaderWithSize = {
    size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    loaderColor?: string;
};

type ILoaderProps = ILoaderWithPageLoader | ILoaderWithSize;

const Loader = (props: ILoaderProps) => {
    let Wrapper = <></>;
    const color = primaryColorConfig[0].main;

    let Spinner = (
        <div
            style={{
                borderColor: "white",
                borderBottomColor: `${color} !important`
            }}
            className={clsx(
                "flex-shrink-0",
                (props as ILoaderWithPageLoader).isPageLoader
                    ? "!h-12 !w-12 border-[4px]"
                    : clsx(
                        (props as ILoaderWithSize).size === "xs" && "!h-4 !w-4 border-[2px]",
                        (props as ILoaderWithSize).size === "sm" &&
                        "!h-4 !w-4 md:!h-5 md:!w-5 border-[2px]",
                        (props as ILoaderWithSize).size === "md" &&
                        "!h-5 md:!h-6 !w-5 md:!w-6 border-[3px]",
                        (props as ILoaderWithSize).size === "lg" &&
                        "!h-7 !w-7 border-[3px]",
                        (props as ILoaderWithSize).size === "xl" &&
                        "!h-8 !w-8 border-[4px]",
                        (props as ILoaderWithSize).size === "2xl" &&
                        "!h-9 !w-9 border-[4px]"
                    ),
                props.loaderColor
                && props.loaderColor,
                " border-solid rounded-full animate-spin"
            )}
        ></div>
    );

    if ((props as ILoaderWithPageLoader).isPageLoader) {
        Wrapper = (
            <div
                className={clsx(
                    "flex justify-center items-center",
                    !(props as ILoaderWithPageLoader).detached && "pb-[70px]"
                )}
            >
                Page loader
            </div>
        );
    } else {
        Wrapper = Spinner;
    }

    return Wrapper;
};

export default Loader;
