import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import CustomAvatar from '@/@core/components/mui/Avatar';

// Sample data, replace this with your actual categories data
const categories = [
    { name: 'Drama' },
    { name: 'Adventure' },
    { name: 'Action' },
    { name: 'Comedy' },
];

const OverlappingCategories = styled(CustomAvatar)(({ theme }) => ({
    marginRight: -15,
    background: theme.palette.primary.main,
    border: `2px solid ${theme.palette.background.paper}`,
    zIndex: 1,
}));

const OverlappingFadeCategories = styled(CustomAvatar)(({ theme }) => ({
    marginRight: -15,
    background: "#c64ffff5",
    border: `2px solid ${theme.palette.background.paper}`,
    zIndex: 1,
    fontSize:"13px"
}));

type CategoryCirclesProps = {
    categories: { categoryName: string }[]
}

const CategoryCircles = (props: CategoryCirclesProps) => {
    return (
        <Box display="flex" alignItems="center">
            {props.categories.map((category, index) => (
               index < 3 ? <OverlappingCategories key={index}>
                    {category.categoryName?.charAt(0)}  
                </OverlappingCategories> : (index === 3) && <OverlappingFadeCategories key={index}>
                    +{(props.categories.length) - 3}
                </OverlappingFadeCategories> 
            ))}
        </Box>
    );
};

export default CategoryCircles;
