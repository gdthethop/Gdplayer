import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';

const UploadVideo = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [genres, setGenres] = useState('');
    const [runtime, setRuntime] = useState('');
    const [cast, setCast] = useState('');
    const [thumbnail, setThumbnail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const videoData = {
            title,
            description,
            link,
            genres: genres.split(','),
            runtime,
            cast: cast.split(','),
            thumbnail,
        };

        try {
            const response = await axios.post('http://localhost:5000/api/videos/upload', videoData);
            alert(response.data.message);
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Failed to upload video. Please try again.');
        }
    };

    return (
        <Box sx={{ padding: '20px' }}>
            <Typography variant="h4">Upload Video</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Title"
                    fullWidth
                    margin="normal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <TextField
                    label="Description"
                    fullWidth
                    margin="normal"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <TextField
                    label="Link"
                    fullWidth
                    margin="normal"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    required
                />
                <TextField
                    label="Genres (comma separated)"
                    fullWidth
                    margin="normal"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                    required
                />
                <TextField
                    label="Runtime"
                    fullWidth
                    margin="normal"
                    value={runtime}
                    onChange={(e) => setRuntime(e.target.value)}
                    required
                />
                <TextField
                    label="Cast (comma separated)"
                    fullWidth
                    margin="normal"
                    value={cast}
                    onChange={(e) => setCast(e.target.value)}
                    required
                />
                <TextField
                    label="Thumbnail Link"
                    fullWidth
                    margin="normal"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    required
                />
                <Button type="submit" variant="contained" color="primary">Upload</Button>
            </form>
        </Box>
    );
};

export default UploadVideo;
