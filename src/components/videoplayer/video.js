import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchVideoDetails,
  fetchVideoDetailsByShortCode,
  updateVideoViewsById,
  updateVideoViewsByShortCode,
  updateVideoLikes,
  incrementVideoLikes,
  decrementVideoLikes,
  incrementVideoDislikes,
  decrementVideoDislikes,
  clearVideoDetails,
} from '../../redux/videoSlice';
import { toggleWatchLaterAction } from '../../redux/userSlice';
import { addToHistory } from '../../redux/historySlice'; // Import History Action
import { Box, Typography, Button, Grid, Avatar } from '@mui/material';
import {
  checkSubscriptionStatus,
  subscribeToChannel,
  unsubscribeFromChannel,
} from '../../redux/subscriptionSlice';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ShareIcon from '@mui/icons-material/Share';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import Header from '../header/header';
import CommentSection from '../comment/comment';
import Recommendation from '../recomendations/recomendation';
import { useParams, useLocation } from 'react-router-dom';
import Hls from 'hls.js';

import CustomControls from './CustomControls';

const VideoPlayer = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const videoContainerRef = useRef(null); // Ref for fullscreen
  const { shortCode } = useParams();
  const location = useLocation();

  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  const [inWatchLater, setInWatchLater] = useState(false); // Watch Later State

  const { isSubscribed } = useSelector((state) => state.subscription);
  const { videoUploader } = useSelector((state) => state.video);

  // Custom Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // ── HLS Quality State ──────────────────────────────────────
  // hlsQualityLevels: array of { index, name, width, height, bitrate }
  const [hlsQualityLevels, setHlsQualityLevels] = useState([]);
  // currentHlsLevel: -1 = Auto, 0/1/2 = specific level index
  const [currentHlsLevel, setCurrentHlsLevel] = useState(-1);

  // ── Buffering State ──────────────────────────────────────────
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0); // 0-100 %
  const [isPreloading, setIsPreloading] = useState(false); // true during initial pre-buffer phase
  const [isRecovering, setIsRecovering] = useState(false); // true when mid-play stall is being healed
  const [recoveryProgress, setRecoveryProgress] = useState(0); // 0-100 % for recovery bar

  const PRE_BUFFER_SECONDS = 5; // seconds to pre-buffer before first play
  const RECOVERY_BUFFER_SECONDS = 4; // seconds ahead before resuming — 4s is enough for brief hiccups
  const RECOVERY_COOLDOWN_MS = 5000; // min ms between recovery triggers — prevents double-recovery loops

  const preloadReadyRef = useRef(false); // tracks if pre-buffer threshold was reached
  const recoveryRef = useRef(false); // tracks if we are in mid-play recovery
  const stallWatchdogRef = useRef(null); // detects silent freezes the browser doesn't surface
  const playPromiseRef = useRef(null); // tracks the in-flight play() Promise to avoid AbortError
  const lastRecoveryTimeRef = useRef(0); // timestamp of last recovery trigger — enforces cooldown

  // ── Safe play/pause helpers ──────────────────────────────────
  // The browser throws "play() interrupted by pause()" when pause() is called
  // before a pending play() Promise resolves. We track the promise and always
  // await it before pausing.
  const safePlay = (video) => {
    if (!video) return;
    const promise = video.play();
    if (promise !== undefined) {
      playPromiseRef.current = promise;
      promise
        .then(() => {
          playPromiseRef.current = null;
        })
        .catch((err) => {
          playPromiseRef.current = null;
          // AbortError = play was interrupted by pause — silent, expected
          if (err.name !== 'AbortError') {
            console.warn('[Player] play() failed:', err.message);
          }
        });
    }
  };

  const safePause = async (video) => {
    if (!video) return;
    // Wait for any in-flight play() to settle before pausing
    if (playPromiseRef.current) {
      await playPromiseRef.current.catch(() => {});
    }
    video.pause();
  };

  // Extract videoId from URL query params if available
  const getQueryParam = (param) =>
    new URLSearchParams(location.search).get(param);
  const videoIdFromQuery = getQueryParam('videoId');

  const {
    videoUrl,
    videoTitle,
    videoDescription,
    videoViews,
    videoLikes,
    videoDislikes,
    videoId,
    hlsUrl,
    transcodingStatus,
    status,
    error,
    isUpdatingLikes,
    isUpdatingDislikes,
  } = useSelector((state) => state.video);

  const user = useSelector((state) => state.auth.user);
  const { watchLaterIds } = useSelector((state) => state.user); // Watch Later IDs

  // Sync Watch Later State
  useEffect(() => {
    if (watchLaterIds && videoId) {
      setInWatchLater(watchLaterIds.includes(videoId));
    }
  }, [watchLaterIds, videoId]);

  useEffect(() => {
    if (videoUploader && videoUploader._id) {
      if (user) dispatch(checkSubscriptionStatus(videoUploader._id));
    }
  }, [dispatch, videoUploader, user]);

  const handleSubscribe = async () => {
    if (!user) {
      alert('Please sign in to subscribe.');
      return;
    }
    if (isSubscribed) {
      await dispatch(unsubscribeFromChannel(videoUploader._id));
    } else {
      await dispatch(subscribeToChannel(videoUploader._id));
    }
  };

  // Helper to convert Cloudinary embed URL to direct MP4 URL
  const getDirectVideoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('https://player.cloudinary.com/embed/')) {
      try {
        const urlObj = new URL(url);
        const publicId = urlObj.searchParams.get('public_id');
        const cloudName = urlObj.searchParams.get('cloud_name');
        if (publicId && cloudName) {
          return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.mp4`;
        }
      } catch (e) {
        console.error('Error parsing Cloudinary URL:', e);
      }
    }
    return url;
  };

  const processedVideoUrl = getDirectVideoUrl(videoUrl);

  // ── HLS.js Setup ─────────────────────────────────────────────
  // Priority: hlsUrl (our transcoded m3u8) > raw MP4 URL.
  // hlsUrl enables true adaptive bitrate switching — quality auto-adjusts to network.
  const activeStreamUrl =
    hlsUrl && transcodingStatus === 'ready' ? hlsUrl : processedVideoUrl;

  // Handler to switch HLS quality level (called from CustomControls)
  const handleQualityChange = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex; // -1 = Auto
      setCurrentHlsLevel(levelIndex);
    }
  };

  useEffect(() => {
    if (!activeStreamUrl || !videoRef.current) return;

    // Clean up any previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Reset quality state for new video
    setHlsQualityLevels([]);
    setCurrentHlsLevel(-1);

    const isHlsStream = activeStreamUrl.includes('.m3u8');

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        // ── Buffer sizing ──────────────────────────────────────────────────────
        // Buffer aggressively ahead so brief network hiccups never stall playback
        maxBufferLength: 60, // aim for 60 s of buffer ahead
        maxMaxBufferLength: 120, // absolute cap at 120 s
        maxBufferSize: 60 * 1000 * 1000, // 60 MB max buffer size
        startFragPrefetch: true, // pre-fetch next segment while current plays

        // ── Adaptive Bitrate (ABR) ─────────────────────────────────────────────
        // Always start at the lowest quality (360p) so the first segment loads
        // instantly. ABR ramps up as bandwidth is measured — this eliminates the
        // most common cause of first-play stalls (cold start at 720p/1080p).
        startLevel: 0, // start at 360p, ramp up
        abrEwmaDefaultEstimate: 500000, // conservative 500 kbps cold-start estimate
        abrBandWidthFactor: 0.75, // use 75% of measured bandwidth (safety margin)
        abrBandWidthUpFactor: 0.5, // step up quality slowly — avoid overshooting

        // ── Error recovery ────────────────────────────────────────────────────
        lowLatencyMode: false,
        maxStarvationDelay: 4, // give up on a stalled segment after 4 s
        fragLoadingMaxRetry: 6, // retry segments up to 6× on network error
        manifestLoadingMaxRetry: 3,
        levelLoadingMaxRetry: 3,
      });

      hls.loadSource(activeStreamUrl);
      hls.attachMedia(videoRef.current);
      hlsRef.current = hls;

      // When manifest is parsed, HLS.js knows all quality levels
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        // Build quality level list for the UI
        const levels = data.levels.map((l, i) => ({
          index: i,
          name: l.height ? `${l.height}p` : `Level ${i}`,
          width: l.width,
          height: l.height,
          bitrate: l.bitrate,
        }));
        setHlsQualityLevels(levels);
        setCurrentHlsLevel(-1); // Auto by default

        // Start pre-buffering phase — HLS.js downloads segments; we wait before playing
        preloadReadyRef.current = false;
        setIsPreloading(true);
        setIsBuffering(false);

        // ── Safety valve: if the buffer gate hasn't fired in 12 s, force-start ──
        // Handles edge cases: CORS issues blocking buffered ranges, very slow networks, etc.
        const safetyTimer = setTimeout(() => {
          if (!preloadReadyRef.current && videoRef.current) {
            console.warn(
              '[HLS] Pre-buffer safety timeout — force starting playback'
            );
            preloadReadyRef.current = true;
            setIsPreloading(false);
            safePlay(videoRef.current);
          }
        }, 12000);

        // Cancel the safety timer if the component unmounts or URL changes
        hls.once(Hls.Events.DESTROYING, () => clearTimeout(safetyTimer));
      });

      // Keep UI in sync when ABR auto-switches quality
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        // Only update if we're in Auto mode (don't override manual selection)
        setCurrentHlsLevel((prev) => (prev === -1 ? -1 : data.level));
      });

      // Handle HLS errors gracefully — attempt recovery before giving up
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            console.warn('[HLS] Network error — attempting recovery...');
            hls.startLoad(); // retry the load
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            console.warn('[HLS] Media error — attempting recovery...');
            hls.recoverMediaError();
          } else {
            console.error('[HLS] Fatal unrecoverable error:', data);
            hls.destroy();
          }
        }
      });
    } else if (
      isHlsStream &&
      videoRef.current.canPlayType('application/vnd.apple.mpegurl')
    ) {
      // Native HLS (Safari) — no quality switching, but it still works
      videoRef.current.src = activeStreamUrl;
    }
    // MP4 / other non-HLS formats are handled by the <source> tag in JSX

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeStreamUrl]);

  // ── Buffer progress tracker + pre-buffer gate + recovery gate ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateBufferProgress = () => {
      if (!video.duration || video.buffered.length === 0) return;

      // Find the furthest buffered end that is reachable from currentTime
      let bufferedEnd = 0;
      for (let i = 0; i < video.buffered.length; i++) {
        if (video.buffered.start(i) <= video.currentTime + 1) {
          bufferedEnd = Math.max(bufferedEnd, video.buffered.end(i));
        }
      }
      const bufferedAhead = bufferedEnd - video.currentTime;

      // Overall buffer percentage for the progress bar
      const pct = Math.min((bufferedEnd / video.duration) * 100, 100);
      setBufferProgress(pct);

      // ── Gate 1: Initial pre-buffer before first play ──
      if (isPreloading && !preloadReadyRef.current) {
        if (
          bufferedAhead >= PRE_BUFFER_SECONDS ||
          bufferedEnd >= video.duration * 0.98
        ) {
          preloadReadyRef.current = true;
          setIsPreloading(false);
          safePlay(video);
        }
        return; // don't run recovery gate while still in initial pre-buffer
      }

      // ── Gate 2: Mid-play stall recovery ──
      if (recoveryRef.current) {
        // Show how far along re-buffering is (0 → RECOVERY_BUFFER_SECONDS)
        const recPct = Math.min(
          (bufferedAhead / RECOVERY_BUFFER_SECONDS) * 100,
          100
        );
        setRecoveryProgress(recPct);

        if (
          bufferedAhead >= RECOVERY_BUFFER_SECONDS ||
          bufferedEnd >= video.duration * 0.98
        ) {
          // Enough buffer built up — resume seamlessly
          recoveryRef.current = false;
          setIsRecovering(false);
          setIsBuffering(false);
          setRecoveryProgress(0);
          safePlay(video);
        }
      }
    };

    video.addEventListener('progress', updateBufferProgress);
    video.addEventListener('timeupdate', updateBufferProgress);

    return () => {
      video.removeEventListener('progress', updateBufferProgress);
      video.removeEventListener('timeupdate', updateBufferProgress);
    };
  }, [isPreloading, processedVideoUrl]);

  // ── Stall detection + mid-play recovery trigger ───────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Called when the browser itself admits it's waiting on data.
    // A 5-second cooldown prevents double-recovery loops: e.g. when ABR switches
    // quality the browser briefly fires 'waiting' even though buffering is fine.
    const onWaiting = () => {
      const now = Date.now();
      const sinceLast = now - lastRecoveryTimeRef.current;

      // Only trigger recovery if:
      //   • not in initial pre-buffer phase
      //   • not already recovering
      //   • video is actually playing (not user-paused)
      //   • cooldown has expired
      if (
        !isPreloading &&
        !recoveryRef.current &&
        !video.paused &&
        sinceLast >= RECOVERY_COOLDOWN_MS
      ) {
        lastRecoveryTimeRef.current = now;
        recoveryRef.current = true;
        setIsRecovering(true);
        setIsBuffering(true);
        setRecoveryProgress(0);
        // Pause so the browser focuses on downloading — await any pending play() first
        safePause(video);
      } else if (
        !isPreloading &&
        !recoveryRef.current &&
        sinceLast >= RECOVERY_COOLDOWN_MS
      ) {
        setIsBuffering(true);
      }
    };

    const onPlaying = () => {
      if (!recoveryRef.current) {
        setIsBuffering(false);
      }
    };

    const onCanPlay = () => {
      // Only clear buffering if we are NOT in active recovery
      // (recovery is cleared by the buffer tracker once the threshold is met)
      if (!recoveryRef.current) {
        setIsBuffering(false);
      }
    };

    // ── Silent freeze watchdog ────────────────────────────────────────────────
    // Some browsers don't fire 'waiting' on every stall. We detect
    // a frozen playhead by checking if currentTime stops advancing.
    // Grace period is 4 ticks (4 s) to avoid false positives during:
    //   • HLS.js ABR quality switches (currentTime can pause 1-3 s)
    //   • Brief network jitter that resolves on its own
    let lastTime = -1;
    let frozenTicks = 0;

    const watchdog = setInterval(() => {
      if (video.paused || video.ended || isPreloading || recoveryRef.current) {
        lastTime = -1;
        frozenTicks = 0;
        return;
      }
      if (video.currentTime === lastTime) {
        frozenTicks++;
        // If playhead hasn't moved for ~4 s, treat it as a genuine stall
        if (frozenTicks >= 4) {
          frozenTicks = 0;
          onWaiting();
        }
      } else {
        frozenTicks = 0;
      }
      lastTime = video.currentTime;
    }, 1000);

    stallWatchdogRef.current = watchdog;

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', onCanPlay);

    return () => {
      clearInterval(watchdog);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [isPreloading, processedVideoUrl]);

  // --- Handlers ---
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        safePlay(videoRef.current);
        setIsPlaying(true);
      } else {
        safePause(videoRef.current);
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    // formatting issue if seeking, don't update
    if (!isSeeking && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setVolume(videoRef.current.volume);
      setIsMuted(videoRef.current.muted);
      // NOTE: We intentionally do NOT pause MP4 here.
      // Calling pause() early stops the browser download pipeline entirely —
      // which is why "0% buffered" happened. Let the browser download freely.
      // The HLS pre-buffer gate is handled separately via Hls.Events.MANIFEST_PARSED.
    }
  };

  const handleSeek = (e, newValue) => {
    setCurrentTime(newValue);
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleSeekMouseUp = (e, newValue) => {
    setIsSeeking(false);
    if (videoRef.current) {
      videoRef.current.currentTime = newValue;
    }
  };

  const handleVolumeChange = (e, newValue) => {
    setVolume(newValue);
    if (videoRef.current) {
      videoRef.current.volume = newValue;
      videoRef.current.muted = newValue === 0;
      setIsMuted(newValue === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      // If unmuting and volume was 0, set to default 1
      if (!videoRef.current.muted && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      } else if (videoRef.current.muted) {
        setVolume(0);
      } else {
        setVolume(videoRef.current.volume);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      } else if (videoContainerRef.current.webkitRequestFullscreen) {
        /* Safari */
        videoContainerRef.current.webkitRequestFullscreen();
      } else if (videoContainerRef.current.msRequestFullscreen) {
        /* IE11 */
        videoContainerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events (esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'msfullscreenchange',
        handleFullscreenChange
      );
    };
  }, []);

  // Sync state on load/update
  useEffect(() => {
    // Reset state when video changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShowControls(false);
    setIsBuffering(false);
    setIsRecovering(false);
    setBufferProgress(0);
    setRecoveryProgress(0);
    setIsPreloading(false);
    preloadReadyRef.current = false;
    recoveryRef.current = false;
    if (stallWatchdogRef.current) {
      clearInterval(stallWatchdogRef.current);
      stallWatchdogRef.current = null;
    }
    // Note: HLS streams trigger isPreloading via Hls.Events.MANIFEST_PARSED.
    // MP4 streams use autoPlay directly — no manual load/pause here.
  }, [processedVideoUrl]); // Trigger whenever the URL changes

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName))
        return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          e.preventDefault();
          video.currentTime = Math.max(video.currentTime - 5, 0);
          break;
        case 'arrowright':
          e.preventDefault();
          video.currentTime = Math.min(video.currentTime + 5, video.duration);
          break;
        case 'j':
          e.preventDefault();
          video.currentTime = Math.max(video.currentTime - 10, 0);
          break;
        case 'l':
          e.preventDefault();
          video.currentTime = Math.min(video.currentTime + 10, video.duration);
          break;
        case 'arrowup':
          e.preventDefault();

          handleVolumeChange(null, Math.min(volume + 0.1, 1));
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(null, Math.max(volume - 0.1, 0));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isPlaying]);

  // --- New Handlers for Controls ---
  const togglePip = async () => {
    try {
      if (videoRef.current) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsPip(false);
        } else {
          await videoRef.current.requestPictureInPicture();
          setIsPip(true);
        }
      }
    } catch (err) {
      console.error('Failed to enter PiP:', err);
    }
  };

  const handlePlaybackRateChange = (newRate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
      setPlaybackRate(newRate);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0
      );
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        videoRef.current.duration
      );
    }
  };

  // --- Watch History Sync ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isPlaying && videoRef.current && videoId && user) {
        dispatch(
          addToHistory({
            videoId,
            progress: videoRef.current.currentTime,
            completed: videoRef.current.ended,
          })
        );
      }
    }, 15000); // Pulse every 15 seconds

    return () => clearInterval(intervalId);
  }, [isPlaying, videoId, user, dispatch]);

  // Also save on pause
  useEffect(() => {
    if (videoRef.current) {
      const onPause = () => {
        if (videoId && user) {
          dispatch(
            addToHistory({
              videoId,
              progress: videoRef.current.currentTime,
              completed: videoRef.current.ended,
            })
          );
        }
        setIsPlaying(false);
      };
      const onPlay = () => setIsPlaying(true);

      videoRef.current.addEventListener('pause', onPause);
      videoRef.current.addEventListener('play', onPlay);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('pause', onPause);
          videoRef.current.removeEventListener('play', onPlay);
        }
      };
    }
  }, [videoId, user, dispatch, processedVideoUrl]);

  useEffect(() => {
    // Clear previous video details immediately to prevent showing old content
    dispatch(clearVideoDetails());

    if (shortCode) {
      dispatch(fetchVideoDetailsByShortCode(shortCode));
      dispatch(updateVideoViewsByShortCode(shortCode));
    } else if (videoIdFromQuery) {
      dispatch(fetchVideoDetails(videoIdFromQuery));
      dispatch(updateVideoViewsById(videoIdFromQuery));
    } else {
      console.error('No valid video ID or shortCode provided.');
    }
  }, [dispatch, shortCode, videoIdFromQuery]);
  const getCurrentVideoId = () => shortCode || videoIdFromQuery || videoId;

  const handleLike = () => {
    if (!user) {
      alert('Please sign in to like this video.');
      return;
    }
    if (!isUpdatingLikes) {
      if (hasLiked) {
        dispatch(decrementVideoLikes());
        setHasLiked(false);
      } else {
        dispatch(incrementVideoLikes());
        setHasLiked(true);
        if (hasDisliked) {
          dispatch(decrementVideoDislikes());
          setHasDisliked(false);
        }
      }
    }
  };

  const handleDislike = () => {
    if (!user) {
      alert('Please sign in to dislike this video.');
      return;
    }
    if (!isUpdatingDislikes) {
      if (hasDisliked) {
        dispatch(decrementVideoDislikes());
        setHasDisliked(false);
      } else {
        dispatch(incrementVideoDislikes());
        setHasDisliked(true);
        if (hasLiked) {
          dispatch(decrementVideoLikes());
          setHasLiked(false);
        }
      }
    }
  };

  const handleWatchLater = async () => {
    if (!user) {
      alert('Please sign in to save to Watch Later.');
      return;
    }
    // Optimistic Update
    setInWatchLater(!inWatchLater);
    await dispatch(toggleWatchLaterAction(videoId));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const controlsTimeoutRef = useRef(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2500);
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(false);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={{ backgroundColor: '#0f0f0f', color: 'white', minHeight: '100vh' }}
    >
      <Header />
      <Box
        sx={{
          maxWidth: '1600px',
          margin: 'auto',
          paddingTop: { xs: '70px', md: '90px' },
          paddingX: { xs: 0, sm: 2, md: 4 },
        }}
      >
        <Grid container spacing={3}>
          {/* Left Column: Video Player & Info */}
          <Grid item xs={12} lg={8.5}>
            {status === 'loading' ? (
              <Typography sx={{ fontSize: '18px', color: 'gray' }}>
                Loading video...
              </Typography>
            ) : error ? (
              <Typography sx={{ fontSize: '18px', color: 'red' }}>
                Error: {error}
              </Typography>
            ) : processedVideoUrl ? (
              <>
                {/* Video Player Container */}
                <Box
                  ref={videoContainerRef}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setShowControls(true)}
                  onMouseLeave={handleMouseLeave}
                  sx={{
                    width: '100%',
                    backgroundColor: '#000',
                    position: 'relative',
                    aspectRatio: { xs: 'auto', md: '16/9' },
                    minHeight: { xs: '220px', sm: '300px', md: 'auto' },
                    maxHeight: { xs: '70vh', md: 'none' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <>
                    <video
                      key={activeStreamUrl}
                      ref={videoRef}
                      onClick={togglePlay}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      onEnterPictureInPicture={() => setIsPip(true)}
                      onLeavePictureInPicture={() => setIsPip(false)}
                      // autoPlay for MP4: browser downloads + plays immediately.
                      // HLS streams are controlled by HLS.js — it starts play
                      // only after the pre-buffer gate in MANIFEST_PARSED fires.
                      autoPlay={!activeStreamUrl.includes('.m3u8')}
                      preload="auto"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    >
                      {/* Only inject <source> for non-HLS (MP4). HLS.js handles m3u8 via JS. */}
                      {!activeStreamUrl.includes('.m3u8') && (
                        <source src={activeStreamUrl} type="video/mp4" />
                      )}
                      Your browser does not support the video tag.
                    </video>

                    {/* ── Buffering / Pre-load Overlay ── */}
                    {(isBuffering || isPreloading || isRecovering) && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isRecovering
                            ? 'rgba(0,0,0,0.7)'
                            : 'rgba(0,0,0,0.55)',
                          backdropFilter: 'blur(4px)',
                          zIndex: 20,
                          gap: 2,
                          pointerEvents: 'none',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        {/* Spinner — red during initial load, amber during recovery */}
                        <Box
                          sx={{
                            width: { xs: 56, sm: 72 },
                            height: { xs: 56, sm: 72 },
                            borderRadius: '50%',
                            border: '4px solid rgba(255,255,255,0.12)',
                            borderTopColor: isRecovering
                              ? '#f5a623'
                              : '#ff0000',
                            animation: 'gdSpin 0.85s linear infinite',
                            '@keyframes gdSpin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' },
                            },
                          }}
                        />

                        {/* Main label */}
                        <Typography
                          sx={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: { xs: '13px', sm: '15px' },
                            fontWeight: 700,
                            letterSpacing: '0.4px',
                          }}
                        >
                          {isRecovering
                            ? 'Re-buffering — will resume automatically'
                            : isPreloading
                              ? 'Buffering video…'
                              : 'Loading…'}
                        </Typography>

                        {/* Progress bar */}
                        <Box
                          sx={{
                            width: { xs: '65%', sm: '42%' },
                            height: '5px',
                            backgroundColor: 'rgba(255,255,255,0.12)',
                            borderRadius: '5px',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: isRecovering
                                ? `${recoveryProgress}%`
                                : `${bufferProgress}%`,
                              background: isRecovering
                                ? 'linear-gradient(90deg, #f5a623, #ffcc70)'
                                : 'linear-gradient(90deg, #ff0000, #ff6b6b)',
                              borderRadius: '5px',
                              transition: 'width 0.35s ease',
                            }}
                          />
                        </Box>

                        {/* Sub-label */}
                        <Typography
                          sx={{
                            color: 'rgba(255,255,255,0.45)',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          {isRecovering
                            ? `${Math.round(recoveryProgress)}% ready — paused to prevent stuttering`
                            : `${Math.round(bufferProgress)}% buffered`}
                        </Typography>
                      </Box>
                    )}

                    <CustomControls
                      onPlayPause={togglePlay}
                      isPlaying={isPlaying}
                      onSeek={handleSeek}
                      onSeekMouseUp={handleSeekMouseUp}
                      onSeekMouseDown={handleSeekMouseDown}
                      currentTime={currentTime}
                      duration={duration}
                      onVolumeChange={handleVolumeChange}
                      onMute={toggleMute}
                      volume={volume}
                      isMuted={isMuted}
                      onFullscreen={toggleFullscreen}
                      isFullscreen={isFullscreen}
                      showControls={showControls}
                      onPip={togglePip}
                      isPip={isPip}
                      playbackRate={playbackRate}
                      onPlaybackRateChange={handlePlaybackRateChange}
                      onSkipBackward={skipBackward}
                      onSkipForward={skipForward}
                      bufferProgress={bufferProgress}
                      // Quality switching
                      hlsQualityLevels={hlsQualityLevels}
                      currentHlsLevel={currentHlsLevel}
                      onQualityChange={handleQualityChange}
                    />
                  </>
                </Box>

                {/* Video Title */}
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '18px', md: '22px' },
                    fontWeight: 700,
                    marginTop: '16px',
                    lineHeight: 1.4,
                    px: { xs: 2, sm: 0 },
                  }}
                >
                  {videoTitle}
                </Typography>

                {/* Metadata & Actions Row */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    marginTop: '12px',
                    gap: 2,
                    px: { xs: 2, sm: 0 },
                  }}
                >
                  {/* Views & Date (Placeholder for date) */}
                  <Typography
                    sx={{ fontSize: '14px', color: '#aaaaaa', fontWeight: 500 }}
                  >
                    {videoViews} views
                  </Typography>

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      width: { xs: '100%', sm: 'auto' },
                      overflowX: 'auto',
                      pb: { xs: 1, sm: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        backgroundColor: '#272727',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        height: '40px',
                      }}
                    >
                      <Button
                        onClick={handleLike}
                        startIcon={
                          hasLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />
                        }
                        sx={{
                          color: 'white',
                          px: { xs: 2, sm: 3 },
                          textTransform: 'none',
                          borderRight: '1px solid #3f3f3f',
                          borderRadius: 0,
                          fontSize: '14px',
                          fontWeight: 600,
                          backgroundColor: hasLiked
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'transparent',
                          '&:hover': { backgroundColor: '#3f3f3f' },
                        }}
                      >
                        {videoLikes}
                      </Button>
                      <Button
                        onClick={handleDislike}
                        startIcon={
                          hasDisliked ? (
                            <ThumbDownIcon />
                          ) : (
                            <ThumbDownOutlinedIcon />
                          )
                        }
                        sx={{
                          color: 'white',
                          px: { xs: 2, sm: 3 },
                          textTransform: 'none',
                          borderRadius: 0,
                          fontSize: '14px',
                          fontWeight: 600,
                          backgroundColor: hasDisliked
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'transparent',
                          '&:hover': { backgroundColor: '#3f3f3f' },
                        }}
                      >
                        {videoDislikes > 0 ? videoDislikes : ''}
                      </Button>
                    </Box>

                    <Button
                      onClick={handleShare}
                      startIcon={<ShareIcon />}
                      sx={{
                        backgroundColor: '#272727',
                        color: 'white',
                        borderRadius: '24px',
                        height: '40px',
                        px: { xs: 2, sm: 3 },
                        textTransform: 'none',
                        fontSize: '14px',
                        fontWeight: 600,
                        '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } },
                        '&:hover': { backgroundColor: '#3f3f3f' },
                      }}
                    >
                      <Box
                        component="span"
                        sx={{ display: { xs: 'none', sm: 'inline' } }}
                      >
                        Share
                      </Box>
                    </Button>

                    <Button
                      onClick={handleWatchLater}
                      startIcon={
                        inWatchLater ? <WatchLaterIcon /> : <AccessTimeIcon />
                      }
                      sx={{
                        backgroundColor: '#272727',
                        color: 'white',
                        borderRadius: '24px',
                        height: '40px',
                        px: { xs: 2, sm: 3 },
                        textTransform: 'none',
                        fontSize: '14px',
                        fontWeight: 600,
                        '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } },
                        '&:hover': { backgroundColor: '#3f3f3f' },
                      }}
                    >
                      <Box
                        component="span"
                        sx={{ display: { xs: 'none', sm: 'inline' } }}
                      >
                        {inWatchLater ? 'Saved' : 'Save'}
                      </Box>
                    </Button>
                  </Box>
                </Box>

                {/* Channel Info & Subscribe */}
                {videoUploader && (
                  <Box
                    sx={{
                      mt: 3,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      py: 2.5,
                      gap: 2,
                      px: { xs: 2, sm: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                      }}
                    >
                      <Avatar
                        src={videoUploader.profileIcon}
                        alt={videoUploader.name}
                        sx={{
                          width: 44,
                          height: 44,
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight="700"
                          sx={{ fontSize: '16px' }}
                        >
                          {videoUploader.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: '#aaa', fontSize: '13px' }}
                        >
                          Creator
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={handleSubscribe}
                      sx={{
                        backgroundColor: isSubscribed
                          ? 'rgba(255,255,255,0.1)'
                          : 'white',
                        color: isSubscribed ? 'white' : 'black',
                        borderRadius: '24px',
                        px: 4,
                        py: 1,
                        fontSize: '14px',
                        fontWeight: '700',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: isSubscribed
                            ? 'rgba(255,255,255,0.2)'
                            : '#e0e0e0',
                        },
                      }}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </Button>
                  </Box>
                )}

                {/* Description Box */}
                <Box
                  sx={{
                    marginTop: '20px',
                    mx: { xs: 2, sm: 0 },
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '16px',
                    transition: 'all 0.2s ease',
                    border: '1px solid rgba(255,255,255,0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderColor: 'rgba(255,255,255,0.1)',
                    },
                    cursor: 'pointer',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      color: '#efefef',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      fontWeight: 400,
                    }}
                  >
                    {videoDescription}
                  </Typography>
                </Box>

                {/* Comments Section */}
                <Box sx={{ marginTop: '24px', px: { xs: 2, sm: 0 } }}>
                  <Typography
                    variant="h3"
                    sx={{ fontSize: '20px', marginBottom: '16px' }}
                  >
                    Comments
                  </Typography>
                  <CommentSection
                    videoId={getCurrentVideoId()}
                    userId={user?.id}
                    name={user?.name}
                  />
                </Box>
              </>
            ) : (
              <Typography sx={{ fontSize: '18px', color: 'red' }}>
                Video URL is missing.
              </Typography>
            )}
          </Grid>

          {/* Right Column: Recommendations */}
          <Grid item xs={12} lg={3.5} sx={{ px: { xs: 2, sm: 0 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Recommendation
                currentVideoId={getCurrentVideoId()}
                currentVideoShortCode={shortCode}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
