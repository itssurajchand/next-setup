'use client'

import { format } from 'date-fns';

import { useEffect, useRef } from "react";

// Component Imports
import CustomChip from '@/@core/components/mui/Chip';
import { CardContent, CardHeader, FormControl, MenuItem, Typography } from "@mui/material";
import Card from '@mui/material/Card';
import { DataGrid, gridClasses, GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';

// Redux Imports
import CustomTextField from '@/@core/components/mui/TextField';
import { useModal } from '@/contexts/ModalProvider';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { usersThunks } from '@/store/slices/users/users.thunk';
import { IGenerateResFn } from '@/utils/generateRes';
import { utils } from '@/utils/utils';
import { usersActions, usersSelectors } from '@/store/slices/users/users.slice';
import { IUser } from '@/models/user.model';
import { useDebounceWithSetter } from '@/hooks/useDebounceWithSetter';
import { IListCreators } from '@/services/types';

const Creators = () => {

    const query = useRef("");
    const modalsContext = useModal();
    const dispatch = useAppDispatch();
    const list = useAppSelector(usersSelectors.creatorsList);
    const { debounceSetter } = useDebounceWithSetter({
        value: list.data.query, delay: 300, functionToFireOnDelay: onQueryChange
    });

    useEffect(() => {
        let approved = list.data.approved
        dispatch(usersThunks.listCreators({
            page: list.data.page,
            sort: list.data.sort ?? undefined,
            order: list.data.order ?? undefined,
            query: list.data.query ?? undefined,
            limit: list.data.limit,
            approved
        }))
    }, [dispatch, list.data.page, list.data.limit, list.data.query, list.data.sort, list.data.order, list.data.approved])

    function onQueryChange() {
        dispatch(usersActions.updatePaginationData({
            query: query.current
        }))
    }

    const onApprovalFilterChange = (approved_: number) => {
        dispatch(usersActions.updatePaginationData({
            approved: approved_ as IListCreators["approved"]
        }))
    }

    const onPaginationModalChange = ({ page, pageSize }: { page: number, pageSize: number }) => {
        dispatch(usersActions.updatePaginationData({
            page: page + 1,
            limit: pageSize
        }))
    }

    const handleSortModel = (newModel: GridSortModel) => {
        if (newModel.length) {
            dispatch(usersActions.updatePaginationData({
                sort: newModel[0].field,
                order: newModel[0].sort ?? undefined
            }))
        }
    }

    const onApproveUnapproveConfimationClick = async (user: IUser) => {
        await new Promise((resolve) => {
            dispatch(usersThunks.approveUnapproveCreator({
                _id: user._id as string,
                approve: !user.approved
            })).then(returnType => {
                const { meta, payload } = returnType;
                if (meta.requestStatus === "fulfilled") {
                    let payload_ = payload as IGenerateResFn;
                    const message = payload_?.message ?? "";
                    utils.toast.success({
                        message
                    })
                    dispatch(usersThunks.listCreators({
                        page: list.data.page,
                        query: list.data.query ?? undefined,
                        limit: list.data.limit,
                        approved: list.data.approved,
                    }))
                } else {
                    utils.toast.error({
                        message:
                            (payload as any)?.message ??
                            utils.CONST.RESPONSE_MESSAGES.SOMETHING_WENT_WRONG,
                    });
                }
                resolve(true)
            })
        });
    }

    const onApproveUnApproveBtnClick = (user: IUser) => {
        modalsContext.openModal({
            type: "alert",
            props: {
                heading: `Confirmation`,
                description: `Are you sure you want to ${user.approved ? "unapprove" : "approve"} ${user.name}\`s profile`,
                okButtonText: user.approved ? "Unapprove" : "Approve",
                okButtonLoadingText: `${user.approved ? "Unapprov" : "Approv"}ing...`,
                cancelButtonText: "Cancel",
                status: "idle",
                visible: true,
                onOkClick: () => onApproveUnapproveConfimationClick(user)
            }
        })
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
            flex: 0.3,
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
            flex: 0.3,
            headerName: 'Phone',
            field: 'phone',
            sortable: true,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant='body2' sx={{ color: 'text.primary' }} height={"100%"} display={'flex'} alignItems={'center'}>
                    {params.row.phoneCode && params.row.phoneNumber ? `+${params.row.phoneCode} ${params.row.phoneNumber}` : 'N/P'}
                </Typography>
            )
        },
        {
            flex: 0.2,
            headerName: 'Approval',
            field: 'approved',
            sortable: true,
            renderCell: (params: GridRenderCellParams) => (
                <CustomChip
                    {...!params.row.approved && {
                        onClick: () => onApproveUnApproveBtnClick(params.row)
                    }}
                    className="w-[120px]"
                    size='small'
                    variant="filled"
                    color={params.row.approved ? 'success' : 'secondary'}
                    label={params.row.approved ? 'Approved' : 'Pending'}
                    sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
                />
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
                    title="Creators"
                    action={
                        <div className='flex items-center flex-wrap space-x-2'>
                            <FormControl size="small">
                                <CustomTextField
                                    select
                                    sx={{
                                        width: 200
                                    }}
                                    value={list.data.approved}
                                    onChange={e => {
                                        onApprovalFilterChange(parseInt(e.target.value))
                                    }}
                                >
                                    <MenuItem value={2}>All</MenuItem>
                                    <MenuItem value={0}>Pending</MenuItem>
                                    <MenuItem value={1}>Approved</MenuItem>
                                </CustomTextField>
                            </FormControl>

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
                                placeholder='Enter creator name or email'
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

export default Creators
