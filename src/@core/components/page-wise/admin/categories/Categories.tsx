'use client'
import { useEffect, useRef } from "react";


import { format } from 'date-fns';

// Component Imports
import { Button, CardContent, CardHeader, IconButton, Typography } from "@mui/material";
import Card from '@mui/material/Card';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';

// Redux Imports
import { useModal } from '@/contexts/ModalProvider';
import type { ICategory } from '@/models/category.model';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { categoryActions, categorySelectors } from '@/store/slices/category/category.slice';
import { categoryThunks } from '@/store/slices/category/category.thunk';
import type { IGenerateResFn } from '@/utils/generateRes';
import { utils } from '@/utils/utils';
import AddEditCategory from './AddEditCategory';
import CustomTextField from '../../../mui/TextField';
import { useDebounceWithSetter } from '@/hooks/useDebounceWithSetter';
import CustomChip from '@/@core/components/mui/Chip';

const Categories = () => {

    const query = useRef("");
    const modalsContext = useModal();
    const dispatch = useAppDispatch();
    const list = useAppSelector(categorySelectors.list);

    const { debounceSetter } = useDebounceWithSetter({
        value: list.data.query, delay: 300, functionToFireOnDelay: onQueryChange
    });

    useEffect(() => {
        dispatch(categoryThunks.list({
            page: list.data.page,
            sort: list.data.sort ?? undefined,
            order: list.data.order ?? undefined,
            query: list.data.query ?? undefined,
            limit: list.data.limit,
        }))
    }, [dispatch, list.data.page, list.data.limit, list.data.query, list.data.sort, list.data.order])

    function onQueryChange() {
        dispatch(categoryActions.updatePaginationData({
            query: query.current
        }))
    }

    const onPaginationModalChange = ({ page, pageSize }: { page: number, pageSize: number }) => {
        dispatch(categoryActions.updatePaginationData({
            page: page + 1,
            limit: pageSize
        }))
    }

    const onAddCategoryButtonClick = () => {
        dispatch(categoryActions.addEditCategory({
            add: true,
            visible: true,
            data: null
        }))
    }

    const onEditButtonClick = (category: ICategory) => {
        dispatch(categoryActions.addEditCategory({
            add: false,
            visible: true,
            data: category
        }))
    }

    const handleSortModel = (newModel: GridSortModel) => {
        if (newModel.length) {
            dispatch(categoryActions.updatePaginationData({
                sort: newModel[0].field,
                order: newModel[0].sort ?? undefined
            }))
        }
    }

    const onDeleteConfirmationButtonClick = async (category: ICategory) => {
        await new Promise((resolve) => {
            dispatch(categoryThunks.deleteCategory(category._id as string)).then(returnType => {
                const { meta, payload } = returnType;

                if (meta.requestStatus === "fulfilled") {
                    const payload_ = payload as IGenerateResFn;
                    const message = payload_?.message ?? "";

                    utils.toast.success({
                        message
                    })
                    dispatch(categoryThunks.list({
                        page: list.data.page,
                        query: list.data.query ?? undefined,
                        limit: list.data.limit,
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

    const onDeleteButtonClick = (category: ICategory) => {
        modalsContext.openModal({
            type: "alert",
            props: {
                heading: `Confirmation`,
                description: `Are you sure you want to delete this category '${category.name}'? By doing so, the movies associated with this category will become inactive.`,
                okButtonText: `Delete`,
                okButtonLoadingText: `Deleting...`,
                cancelButtonText: "Cancel",
                status: "idle",
                visible: true,
                onOkClick: () => onDeleteConfirmationButtonClick(category)
            }
        })
    }

    const columns: GridColDef[] = [
        {
            flex: 0.4,
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
            flex: 0.2,
            headerName: 'Status',
            field: 'status',
            sortable: true,
            renderCell: (params: GridRenderCellParams) => (
                <CustomChip
                    className="w-[80px]"
                    size='small'
                    variant="filled"
                    color={params.row.status ? 'success' : 'error'}
                    label={params.row.status ? 'Active' : 'Inactive'}
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
                        {format(new Date(params.row.createdAt), 'MM-dd-yyyy')}
                    </Typography>
                )
            }
        },
        {
            flex: 0.2,
            field: 'id',
            headerName: 'Action',
            renderCell: (params: GridRenderCellParams) => {
                return (
                    <div>
                        <IconButton className='text-textPrimary' onClick={() => onEditButtonClick(params.row)}>
                            <i className='tabler-edit text-xl cursor-pointer' />
                        </IconButton>
                        <IconButton className='text-textPrimary' onClick={() => onDeleteButtonClick(params.row)}>
                            <i className='tabler-trash text-xl cursor-pointer' />
                        </IconButton>
                    </div>
                )
            }
        },
    ]

    return (
        <>
            <AddEditCategory />

            <Card style={{ width: '100%' }}>
                <CardHeader
                    sx={{ padding: 3 }}
                    title="Categories"
                    action={
                        <div className='flex items-center flex-wrap space-x-2'>
                            <CustomTextField
                                autoFocus
                                sx={{
                                    width: 250
                                }}
                                type='text'
                                name='category'
                                defaultValue={query.current}
                                onKeyUpCapture={(e) => {
                                    query.current = (e.target as any).value;
                                    debounceSetter((e.target as any).value)
                                }}
                                placeholder='Enter category name'
                            />
                            <Button variant='contained' className='flex items-center space-x-2' onClick={onAddCategoryButtonClick}
                                startIcon={<i className='tabler-plus' />}>
                                <Typography variant='body2' sx={{ fontWeight: 500, color: "white" }}>
                                    Add
                                </Typography>
                            </Button>
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
                        rows={list.data.categories}
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
            </Card>
        </>
    )
}

export default Categories
