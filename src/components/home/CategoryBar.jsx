import React from 'react';
import { Box, Chip } from '@mui/material';

const categories = [
    'All',
    'Action',
    'Comedy',
    'Drama',
    'Sci-Fi',
    'Horror',
    'Documentary',
    'Thriller',
    'Romance',
    'Animation',
    'Gaming',
    'Music'
];

const CategoryBar = ({ selectedCategory, onSelectCategory }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1.5,
                overflowX: 'auto',
                p: 2,
                backgroundColor: '#0f0f0f',
                position: 'sticky',
                top: 64, // below header
                zIndex: 10,
                '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar
            }}
        >
            {categories.map((category) => (
                <Chip
                    key={category}
                    label={category}
                    onClick={() => onSelectCategory(category)}
                    sx={{
                        backgroundColor: selectedCategory === category ? '#fff' : '#272727',
                        color: selectedCategory === category ? '#000' : '#fff',
                        fontWeight: selectedCategory === category ? 'bold' : 'normal',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                            backgroundColor: selectedCategory === category ? '#fff' : '#3f3f3f',
                        },
                    }}
                />
            ))}
        </Box>
    );
};

export default CategoryBar;
