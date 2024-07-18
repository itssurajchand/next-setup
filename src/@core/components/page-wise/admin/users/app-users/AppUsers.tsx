'use client'

import { format } from 'date-fns';

import { useEffect, useRef } from "react";

// Component Imports
import { CardContent, CardHeader, Typography } from "@mui/material";
import Card from '@mui/material/Card';
import { DataGrid, gridClasses, GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';

// Redux Imports
import CustomTextField from '@/@core/components/mui/TextField';
import { useModal } from '@/contexts/ModalProvider';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { usersThunks } from '@/store/slices/users/users.thunk';
import { usersActions, usersSelectors } from '@/store/slices/users/users.slice';
import { useDebounceWithSetter } from '@/hooks/useDebounceWithSetter';

const AppUsers = () => {

    const query = useRef("");
    const dispatch = useAppDispatch();
    const list = useAppSelector(usersSelectors.usersList);
    const { debounceSetter } = useDebounceWithSetter({
        value: list.data.query, delay: 300, functionToFireOnDelay: onQueryChange
    });

    useEffect(() => {
        dispatch(usersThunks.listUsers({
            page: list.data.page,
            sort: list.data.sort ?? undefined,
            order: list.data.order ?? undefined,
            query: list.data.query ?? undefined,
            limit: list.data.limit,
        }))
    }, [dispatch, list.data.page, list.data.limit, list.data.query, list.data.sort, list.data.order])

    function onQueryChange() {
        dispatch(usersActions.updateUsersPaginationData({
            query: query.current
        }))
    }

    const onPaginationModalChange = ({ page, pageSize }: { page: number, pageSize: number }) => {
        dispatch(usersActions.updateUsersPaginationData({
            page: page + 1,
            limit: pageSize
        }))
    }

    const handleSortModel = (newModel: GridSortModel) => {
        if (newModel.length) {
            dispatch(usersActions.updateUsersPaginationData({
                sort: newModel[0].field,
                order: newModel[0].sort ?? undefined
            }))
        }
    }

    const columns: GridColDef[] = [
        {
            flex: 0.3,
            headerName: 'Name',
            field: 'name',
            sortable: true,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant='body2' sx={{ color: 'text.primary' }} height={"100%"} display={'flex'} alignItems={'center'}>
                    {params.row.name}
                </Typography>
            )
        },
        {
            flex: 0.5,
            headerName: 'Email',
            field: 'email',
            sortable: true,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant='body2' sx={{ color: 'text.primary' }} height={"100%"} display={'flex'} alignItems={'center'}>
                    {params.row.email}
                </Typography>
            )
        },
        {
            flex: 0.2,
            type: "date",
            sortable: true,
            field: 'createdAt',
            headerName: 'Created at',
            valueFormatter: (value) => new Date(value),
            renderCell: (params: GridRenderCellParams) => {
                return (
                    <Typography variant='body2' sx={{ color: 'text.primary' }} height={"100%"} display={'flex'} alignItems={'center'}>
                        {format(new Date(params.row.createdAt), 'yyyy-MM-dd')}
                    </Typography>
                )
            }
        }
    ]

    return (
        <>
            <Card style={{ width: '100%' }}>
                <CardHeader
                    sx={{ padding: 3 }}
                    title="App Users"
                    action={
                        <div className='flex items-center flex-wrap space-x-2'>
                            <CustomTextField
                                autoFocus
                                sx={{
                                    width: 250
                                }}
                                defaultValue={query.current}
                                onKeyUpCapture={(e) => {
                                    query.current = (e.target as any).value;
                                    debounceSetter((e.target as any).value)
                                }}
                                type='text'
                                name='userName'
                                placeholder='Enter user name or email'
                            />
                        </div>
                    } />
                <CardContent sx={{ padding: 0 }}>
                    <DataGrid
                        loading={list.status === "loading"}
                        sx={{
                            [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                                outline: 'transparent',
                            },
                            [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]: {
                                outline: 'none',
                            },
                        }}
                        autoHeight
                        sortingMode='server'
                        rowSelection={false}
                        rows={list.data.users}
                        columns={columns}
                        onSortModelChange={handleSortModel}
                        rowCount={list.data.totalCount}
                        disableColumnMenu
                        pageSizeOptions={[10, 25, 50]}
                        paginationMode="server"
                        paginationModel={{
                            page: list.data.page - 1,
                            pageSize: list.data.limit,
                        }}
                        onPaginationModelChange={onPaginationModalChange}
                    />
                </CardContent>
            </Card >
        </>
    )
}

export default AppUsers
