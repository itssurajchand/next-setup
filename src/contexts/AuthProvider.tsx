'use client'

import useLocalStorage from '@/@core/hooks/useLocalStorage';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { userThunks } from '@/store/slices/user/user.thunk';
import { utils } from '@/utils/utils';
import { SessionContextValue, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';

const types = utils.CONST.USER.NUMERIC_TYPES;

type IUserTypeNumeric = keyof (typeof types);

type IAuthProviderContext = {
    loading: boolean
    userType: IUserType | null
}

type IUserType = "admin" | "creator";

type IAuthProviderProps = PropsWithChildren & {
}

const AuthProviderContext = createContext<IAuthProviderContext>({
    loading: true,
    userType: null
});

const useAuthProviderContext = () => useContext(AuthProviderContext);

const AuthProvider = (props: IAuthProviderProps) => {

    const session = useSession();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const localStorage = useLocalStorage();

    const [loading] = useState(false);
    const [userType, setUserType] = useState<IUserType | null>(null);


    useEffect(() => {
        localStorage.getKey({ key: "SIGN_UP" });
        if (localStorage.loading || session.status === "loading") {
            return;
        }
        onSessionStateChange(session);
    }, [localStorage.loading, localStorage.value, pathname, session.status]);


    useEffect(() => {
        const authenticated = session.status === "authenticated"
        if (authenticated) {
            dispatch(userThunks.get());
        }
    }, [session.status])


    const updateUserType = (userType: IUserTypeNumeric) => {
        const { CREATOR } = utils.CONST.USER.TYPES;
        const type_ = userType === CREATOR ? "creator" : "admin";
        setUserType(type_);
    }

    const onSessionStateChange = (session: SessionContextValue) => {
        const user = session.data?.user;
        const authenticated = session.status === "authenticated"

        if (authenticated) {

            if (user?.token) {
                localStorage.setKey({
                    key: "ACCESS_TOKEN",
                    value: (user as any).token
                })

                if (user.type) {
                    updateUserType(user.type)
                }
            }

            localStorage.removeKey({ key: "SIGN_UP" });
        }
    }

    return (
        <>
            <AuthProviderContext.Provider
                value={{ loading, userType }}>
                {props.children}
            </AuthProviderContext.Provider>
        </>
    )
}

export default AuthProvider

export { useAuthProviderContext };
