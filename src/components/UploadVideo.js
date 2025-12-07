import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  LinearProgress,
  Grid,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import checkCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import PlaylistSelector from './PlaylistSelector';

const UploadVideo = () => {
  // UI State
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingThumbs, setProcessingThumbs] = useState(false);

  // Data State
  const [videoUrl, setVideoUrl] = useState(null);
  const [generatedThumbnails, setGeneratedThumbnails] = useState([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);

  // Metadata State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [playlistName, setPlaylistName] = useState([]);

  // 1. Handle File Drop & Immediate Upload
  const onDrop = useCallback(async (acceptedFiles) => {
    const videoFile = acceptedFiles[0];
    if (videoFile) {
      setFile(videoFile);
      setTitle(videoFile.name.replace(/\.[^/.]+$/, ''));
      setUploading(true);
      setUploadProgress(0);

      // Start Raw Upload Immediately
      const formData = new FormData();
      formData.append('video', videoFile);

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/videos/upload-raw`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percent);
            },
          }
        );

        const s3Url = response.data.videoUrl;
        setVideoUrl(s3Url);
        setUploading(false); // Valid upload done

        // Trigger Thumbnail Generation
        handleGenerateThumbnails(s3Url);
      } catch (error) {
        console.error('Upload failed', error);
        alert('Upload failed. Please try again.');
        setUploading(false);
        setFile(null); // Reset
      }
    }
  }, []);

  // 2. Generate Thumbnails
  const handleGenerateThumbnails = async (url) => {
    setProcessingThumbs(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/videos/generate-thumbnails`,
        {
          videoUrl: url,
        }
      );
      setGeneratedThumbnails(response.data.thumbnails);
      if (response.data.thumbnails.length > 0) {
        setSelectedThumbnail(response.data.thumbnails[1]); // Default to middle one
      }
    } catch (error) {
      console.error('Thumbnail generation error', error);
      // Non-blocking, user can still publish with placeholder or upload custom if we added that feature
    } finally {
      setProcessingThumbs(false);
    }
  };

  // 2.5: Handle Custom Thumbnail Upload
  const handleCustomThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('thumbnail', file);

    try {
      // Optimistically show it or wait? Let's wait for S3 url
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/videos/upload-thumbnail`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const customUrl = response.data.thumbnailUrl;
      // Add to list and select it
      setGeneratedThumbnails((prev) => [customUrl, ...prev]);
      setSelectedThumbnail(customUrl);
    } catch (error) {
      console.error('Custom thumbnail upload failed', error);
      alert('Failed to upload thumbnail.');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    maxFiles: 1,
    disabled: !!file, // Disable dropzone if file is already present
  });

  const handlePlaylistChange = (val) => setPlaylistName(val);
  const handleNewPlaylist = (val) => setPlaylistName((prev) => [...prev, val]);

  // 3. Publish (Final Step)
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!videoUrl) return;

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/videos/publish`,
        {
          title,
          description,
          playlistNames: JSON.stringify(playlistName),
          videoUrl,
          thumbnailUrl: selectedThumbnail,
        }
      );

      alert('Video published successfully!');
      // Reset all
      setFile(null);
      setVideoUrl(null);
      setTitle('');
      setDescription('');
      setPlaylistName([]);
      setGeneratedThumbnails([]);
      setSelectedThumbnail(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Publish failed', error);
      alert('Failed to publish video.');
    }
  };

  const isPublishDisabled =
    !videoUrl || !title || uploading || processingThumbs;

  return (
    <Box
      sx={{
        padding: '40px',
        maxWidth: '1000px',
        margin: '0 auto',
        color: '#fff',
      }}
    >
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Upload Video
      </Typography>

      {!file ? (
        <Paper
          {...getRootProps()}
          sx={{
            p: 10,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? '#333' : '#1e1e1e',
            border: '2px dashed #555',
            color: '#aaa',
            transition: '0.3s',
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 60, mb: 2, color: '#a80000' }} />
          <Typography variant="h6">
            {isDragActive
              ? 'Drop the video here...'
              : 'Drag & drop video files to upload'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Your upload will start immediately.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3, backgroundColor: '#a80000' }}
          >
            Select Files
          </Button>
        </Paper>
      ) : (
        <form onSubmit={handlePublish}>
          {/* Top Bar: Progress */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: '#1e1e1e' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              {uploading ? (
                <CircularProgress size={20} sx={{ color: '#a80000' }} />
              ) : (
                <CheckCircleIcon color="success" />
              )}
              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                {uploading
                  ? `Uploading ${file.name}...`
                  : `Uploaded: ${file.name}`}
              </Typography>
              <Typography>{uploadProgress}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#333',
                '& .MuiLinearProgress-bar': {
                  bgcolor: uploading ? '#a80000' : '#2e7d32',
                },
              }}
            />
          </Paper>

          <Box
            sx={{
              display: 'flex',
              gap: 4,
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            {/* Left: Metadata */}
            <Box sx={{ flex: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Details
              </Typography>

              <TextField
                label="Title (required)"
                fullWidth
                margin="normal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                variant="filled"
                sx={{
                  bgcolor: '#222',
                  input: { color: 'white' },
                  label: { color: '#888' },
                }}
              />
              <TextField
                label="Description (required)"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                variant="filled"
                sx={{
                  bgcolor: '#222',
                  textarea: { color: 'white' },
                  label: { color: '#888' },
                }}
              />
              <PlaylistSelector
                selectedPlaylist={playlistName}
                onPlaylistChange={handlePlaylistChange}
                onNewPlaylist={handleNewPlaylist}
              />

              {/* Thumbnails Section */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Thumbnail
              </Typography>

              <Grid container spacing={2}>
                {/* Custom Upload Tile */}
                <Grid item xs={4}>
                  <Button
                    component="label"
                    sx={{
                      width: '100%',
                      aspectRatio: '16/9',
                      border: '1px dashed #555',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#888',
                      textTransform: 'none',
                    }}
                  >
                    <CloudUploadIcon />
                    <Typography variant="caption" sx={{ mt: 1 }}>
                      Upload Custom
                    </Typography>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleCustomThumbnail}
                    />
                  </Button>
                </Grid>

                {/* Generated Thumbnails */}
                {generatedThumbnails.map((thumb, index) => (
                  <Grid item xs={4} key={index}>
                    <Box
                      onClick={() => setSelectedThumbnail(thumb)}
                      sx={{
                        border:
                          selectedThumbnail === thumb
                            ? '3px solid #a80000'
                            : '3px solid transparent',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        aspectRatio: '16/9',
                      }}
                    >
                      <img
                        src={thumb}
                        alt={`Thumbnail ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
                {generatedThumbnails.length === 0 &&
                  !uploading &&
                  !processingThumbs && (
                    <Typography
                      variant="body2"
                      sx={{ color: '#666', fontStyle: 'italic', mt: 2, ml: 2 }}
                    >
                      Thumbnails will appear here once upload is complete.
                    </Typography>
                  )}
              </Grid>

              {processingThumbs && (
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    color: '#888',
                  }}
                >
                  <CircularProgress size={20} color="inherit" />
                  <Typography variant="caption">
                    Generating auto-thumbnails...
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Right: Preview / Publish Action */}
            <Box sx={{ flex: 1 }}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: '#1e1e1e',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    bgcolor: '#000',
                    aspectRatio: '16/9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedThumbnail ? (
                    <img
                      src={selectedThumbnail}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Typography variant="caption" sx={{ color: '#555' }}>
                      Video Preview
                    </Typography>
                  )}
                </Box>
                <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mb: 2, color: '#aaa' }}
                  >
                    {isPublishDisabled &&
                      'Please wait for upload to finish and fill all fields.'}
                  </Typography>
                  <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    disabled={isPublishDisabled}
                    size="large"
                    sx={{
                      backgroundColor: '#a80000',
                      py: 1.5,
                      fontSize: '1.1rem',
                    }}
                  >
                    Publish
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default UploadVideo;
