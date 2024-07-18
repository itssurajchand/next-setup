// ############################################################
/**
 * @todo Document this
 */
// ############################################################

import { useState, useEffect } from "react";

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


type IUseDebounceWithSetter = {
    value?: any,
    delay: number,
    functionToFireOnDelay?: Function
}


export const useDebounceWithSetter = (props: IUseDebounceWithSetter) => {

    const { value, delay, functionToFireOnDelay } = props;
    const [debouncedValue, setDebouncedValue] = useState(value);

    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    /**
     * @TODO Document this
     */
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);


    // Functions

    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    /**
     * @TODO Document this
     */
    const debounceSetter = () => {
        let id: NodeJS.Timeout;
        return (value: any) => {
            clearTimeout(id);
            id = setTimeout(() => {
                if (functionToFireOnDelay)
                    functionToFireOnDelay();
                setDebouncedValue(value)
            }, delay)
        }
    }

    const setter = debounceSetter()

    return {
        debouncedValue,
        debounceSetter: setter
    };
}
