import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  LinearProgress,
  Grid,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import axios from 'axios';
import PlaylistSelector from './PlaylistSelector';

const UploadVideo = () => {
  const { user, token } = useSelector((state) => state.auth);

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
  const [scheduledPublishDate, setScheduledPublishDate] = useState('');

  // Auth Config
  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // 1. Handle File Drop & Immediate Upload
  const onDrop = useCallback(
    async (acceptedFiles) => {
      const videoFile = acceptedFiles[0];
      if (videoFile) {
        setFile(videoFile);
        setTitle(videoFile.name.replace(/\.[^/.]+$/, ''));
        setUploading(true);
        setUploadProgress(0);

        const fileSizeInMB = videoFile.size / (1024 * 1024);
        const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
        const USE_MULTIPART = fileSizeInMB > 100; // Use multipart for files >100MB

        try {
          let s3Url;

          if (USE_MULTIPART) {
            // Multipart Upload for Large Files
            console.log(
              `Using multipart upload for ${fileSizeInMB.toFixed(2)}MB file`
            );

            // Step 1: Initialize multipart upload
            const initResponse = await axios.post(
              `${process.env.REACT_APP_BACKEND_URL}/api/multipart-upload/initialize`,
              {
                fileName: videoFile.name,
                fileType: videoFile.type,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const { uploadId, key } = initResponse.data;

            // Step 2: Calculate number of parts
            const numParts = Math.ceil(videoFile.size / CHUNK_SIZE);

            // Step 3: Get presigned URLs for all parts
            const urlsResponse = await axios.post(
              `${process.env.REACT_APP_BACKEND_URL}/api/multipart-upload/presigned-urls`,
              {
                uploadId,
                key,
                parts: numParts,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const { presignedUrls } = urlsResponse.data;

            // Step 4: Upload each part
            const uploadedParts = [];
            for (let i = 0; i < numParts; i++) {
              const start = i * CHUNK_SIZE;
              const end = Math.min(start + CHUNK_SIZE, videoFile.size);
              const chunk = videoFile.slice(start, end);

              const partResponse = await axios.put(
                presignedUrls[i].url,
                chunk,
                {
                  headers: {
                    'Content-Type': videoFile.type,
                  },
                  onUploadProgress: (progressEvent) => {
                    const partProgress =
                      (progressEvent.loaded / progressEvent.total) * 100;
                    const totalProgress =
                      ((i + partProgress / 100) / numParts) * 100;
                    setUploadProgress(Math.round(totalProgress));
                  },
                }
              );

              uploadedParts.push({
                ETag: partResponse.headers.etag.replace(/"/g, ''),
                PartNumber: i + 1,
              });
            }

            // Step 5: Complete multipart upload
            const completeResponse = await axios.post(
              `${process.env.REACT_APP_BACKEND_URL}/api/multipart-upload/complete`,
              {
                uploadId,
                key,
                parts: uploadedParts,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            s3Url = completeResponse.data.videoUrl;
          } else {
            // Standard Upload for Smaller Files
            const formData = new FormData();
            formData.append('video', videoFile);

            const response = await axios.post(
              `${process.env.REACT_APP_BACKEND_URL}/api/videos/upload-raw`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${token}`,
                },
                onUploadProgress: (progressEvent) => {
                  const percent = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                  setUploadProgress(percent);
                },
              }
            );

            s3Url = response.data.videoUrl;
          }

          setVideoUrl(s3Url);
          setUploading(false);

          // Trigger Thumbnail Generation
          handleGenerateThumbnails(s3Url);
        } catch (error) {
          console.error('Upload failed', error);
          alert('Upload failed. Please try again.');
          setUploading(false);
          setFile(null);
        }
      }
    },
    [token]
  );

  // 2. Generate Thumbnails
  const handleGenerateThumbnails = async (url) => {
    setProcessingThumbs(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/videos/generate-thumbnails`,
        { videoUrl: url },
        authConfig
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
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
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
          scheduledPublishDate: scheduledPublishDate || null,
        },
        authConfig
      );

      alert('Video published successfully!');
      // Reset all
      setFile(null);
      setVideoUrl(null);
      setTitle('');
      setDescription('');
      setScheduledPublishDate('');
      setPlaylistName([]);
      setGeneratedThumbnails([]);
      setSelectedThumbnail(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Publish failed', error);
      alert('Failed to publish video.');
    }
  };

  if (!user) {
    return (
      <Box
        sx={{
          height: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <LockIcon sx={{ fontSize: 60, mb: 2, color: '#a80000' }} />
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          Sign in to Upload
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 4, color: '#aaa', maxWidth: 400 }}
        >
          You need an account to upload videos, like, and comment. Join our
          community today!
        </Typography>
        <Button
          component={Link}
          to="/login"
          variant="contained"
          size="large"
          sx={{ backgroundColor: '#a80000', px: 4 }}
        >
          Sign In
        </Button>
      </Box>
    );
  }

  const isPublishDisabled =
    !videoUrl || !title || uploading || processingThumbs;

  return (
    <Box
      sx={{
        padding: { xs: '20px', md: '40px' },
        maxWidth: '1200px',
        margin: '0 auto',
        color: '#fff',
      }}
    >
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: 'bold', fontFamily: '"Outfit", sans-serif' }}
      >
        Upload Video
      </Typography>

      {!file ? (
        <Paper
          {...getRootProps()}
          elevation={6}
          sx={{
            p: 10,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? '#2a2a2a' : '#1e1e1e',
            border: '2px dashed #444',
            color: '#aaa',
            transition: '0.3s',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            '&:hover': {
              borderColor: '#a80000',
              backgroundColor: '#252525',
            },
          }}
        >
          <input {...getInputProps()} />
          <Box
            sx={{
              bgcolor: '#111',
              p: 4,
              borderRadius: '50%',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileUploadIcon sx={{ fontSize: 60, color: '#a80000' }} />
          </Box>
          <Typography
            variant="h5"
            sx={{ mb: 1, color: '#fff', fontWeight: 600 }}
          >
            {isDragActive
              ? 'Drop it here!'
              : 'Drag and drop video files to upload'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#888' }}>
            Your videos will be private until you publish them.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#a80000',
              fontWeight: 'bold',
              px: 5,
              py: 1.5,
            }}
          >
            Select Files
          </Button>
        </Paper>
      ) : (
        <form onSubmit={handlePublish}>
          {/* Top Bar: Progress */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: '#1e1e1e', borderRadius: '12px' }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}
            >
              {uploading ? (
                <CircularProgress size={24} sx={{ color: '#a80000' }} />
              ) : (
                <CheckCircleIcon color="success" sx={{ fontSize: 28 }} />
              )}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {uploading
                    ? `Uploading ${file.name}...`
                    : `Upload Complete: ${file.name}`}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                {uploadProgress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 6,
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
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
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
                  borderRadius: '4px',
                  input: { color: 'white' },
                  label: { color: '#888' },
                  '& .MuiFilledInput-root': { bgcolor: '#222' },
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
                  borderRadius: '4px',
                  textarea: { color: 'white' },
                  label: { color: '#888' },
                  '& .MuiFilledInput-root': { bgcolor: '#222' },
                }}
              />

              <Box sx={{ mt: 2 }}>
                <PlaylistSelector
                  selectedPlaylist={playlistName}
                  onPlaylistChange={handlePlaylistChange}
                  onNewPlaylist={handleNewPlaylist}
                  token={token}
                />
              </Box>

              <TextField
                label="Schedule Publishing (Optional)"
                type="datetime-local"
                fullWidth
                margin="normal"
                value={scheduledPublishDate}
                onChange={(e) => setScheduledPublishDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                  style: { color: '#888' },
                }}
                variant="filled"
                sx={{
                  bgcolor: '#222',
                  borderRadius: '4px',
                  input: { color: 'white' },
                  mt: 3,
                  '& .MuiFilledInput-root': { bgcolor: '#222' },
                }}
                helperText="Leave blank to publish immediately"
                FormHelperTextProps={{ sx: { color: '#666' } }}
              />

              {/* Thumbnails Section */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                Thumbnail
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#aaa' }}>
                Select or upload a picture that shows what's in your video. A
                good thumbnail stands out and draws viewers' attention.
              </Typography>

              <Grid container spacing={2}>
                {/* Custom Upload Tile */}
                <Grid item xs={6} sm={4}>
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
                      color: '#fff',
                      textTransform: 'none',
                      bgcolor: '#1e1e1e',
                      '&:hover': { bgcolor: '#252525' },
                    }}
                  >
                    <CloudUploadIcon sx={{ mb: 1, color: '#aaa' }} />
                    <Typography variant="caption">Upload file</Typography>
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
                  <Grid item xs={6} sm={4} key={index}>
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
                        position: 'relative',
                        transition: 'all 0.2s',
                        '&:hover': { opacity: 0.8 },
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
            <Box sx={{ flex: 1, minWidth: '300px' }}>
              <Paper
                elevation={4}
                sx={{
                  p: 2,
                  bgcolor: '#1e1e1e',
                  position: 'sticky',
                  top: '20px',
                  borderRadius: '8px',
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    bgcolor: '#000',
                    aspectRatio: '16/9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    overflow: 'hidden',
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
                    <Box sx={{ textAlign: 'center', color: '#555' }}>
                      <Typography variant="caption">Video Preview</Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#888', mb: 0.5 }}
                  >
                    Video Link
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#3ea6ff', wordBreak: 'break-all' }}
                  >
                    {videoUrl || 'Processing...'}
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#888', mt: 2, mb: 0.5 }}
                  >
                    Filename
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff' }}>
                    {file.name}
                  </Typography>
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
                      color: 'white',
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}
                  >
                    {scheduledPublishDate ? 'Schedule' : 'Publish'}
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
