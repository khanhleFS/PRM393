import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_tokens.dart';

class FloatingAudioPlayer extends StatefulWidget {
  final String novelTitle;
  final String chapterTitle;
  final String? coverUrl;
  final String? audioUrl;
  final bool hasPrevChapter;
  final bool hasNextChapter;
  final VoidCallback onPrevChapter;
  final VoidCallback onNextChapter;
  final Future<void> Function() onGenerateAudio;
  final VoidCallback onClose;

  const FloatingAudioPlayer({
    super.key,
    required this.novelTitle,
    required this.chapterTitle,
    this.coverUrl,
    this.audioUrl,
    required this.hasPrevChapter,
    required this.hasNextChapter,
    required this.onPrevChapter,
    required this.onNextChapter,
    required this.onGenerateAudio,
    required this.onClose,
  });

  @override
  State<FloatingAudioPlayer> createState() => _FloatingAudioPlayerState();
}

class _FloatingAudioPlayerState extends State<FloatingAudioPlayer> {
  final AudioPlayer _player = AudioPlayer();

  bool _isPlaying = false;
  bool _isGenerating = false;
  Duration _duration = Duration.zero;
  Duration _position = Duration.zero;
  final double _volume = 1.0;
  bool _isMuted = false;
  String? _currentLoadedUrl;

  @override
  void initState() {
    super.initState();
    _initAudioListeners();
    if (widget.audioUrl != null && widget.audioUrl!.isNotEmpty) {
      _loadAndPlay(widget.audioUrl!);
    }
  }

  @override
  void didUpdateWidget(covariant FloatingAudioPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.audioUrl != oldWidget.audioUrl) {
      if (widget.audioUrl != null && widget.audioUrl!.isNotEmpty) {
        _loadAndPlay(widget.audioUrl!);
      } else {
        _player.stop();
        setState(() {
          _isPlaying = false;
          _position = Duration.zero;
          _duration = Duration.zero;
          _currentLoadedUrl = null;
        });
      }
    }
  }

  void _initAudioListeners() {
    _player.onDurationChanged.listen((d) {
      if (mounted) setState(() => _duration = d);
    });

    _player.onPositionChanged.listen((p) {
      if (mounted) setState(() => _position = p);
    });

    _player.onPlayerStateChanged.listen((s) {
      if (mounted) {
        setState(() => _isPlaying = (s == PlayerState.playing));
      }
    });

    _player.onPlayerComplete.listen((_) {
      if (mounted) {
        setState(() {
          _isPlaying = false;
          _position = Duration.zero;
        });
      }
    });
  }

  Future<void> _loadAndPlay(String url) async {
    try {
      _currentLoadedUrl = url;
      await _player.stop();
      await _player.setSource(UrlSource(url));
      await _player.resume();
      if (mounted) setState(() => _isPlaying = true);
    } catch (e) {
      debugPrint('[AudioPlayer] Error loading url: $e');
    }
  }

  Future<void> _togglePlayPause() async {
    if (widget.audioUrl == null || widget.audioUrl!.isEmpty) return;

    if (_isPlaying) {
      await _player.pause();
    } else {
      if (_currentLoadedUrl != widget.audioUrl) {
        await _loadAndPlay(widget.audioUrl!);
      } else {
        await _player.resume();
      }
    }
  }

  Future<void> _handleGenerateAudio() async {
    if (_isGenerating) return;
    setState(() => _isGenerating = true);
    try {
      await widget.onGenerateAudio();
    } finally {
      if (mounted) setState(() => _isGenerating = false);
    }
  }

  String _formatTime(Duration d) {
    final mins = d.inMinutes;
    final secs = d.inSeconds % 60;
    return '$mins:${secs < 10 ? '0' : ''}$secs';
  }

  @override
  void dispose() {
    _player.stop();
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hasAudio = widget.audioUrl != null && widget.audioUrl!.isNotEmpty;
    final remaining = (_duration > _position) ? _duration - _position : Duration.zero;

    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B).withValues(alpha: 0.96),
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.12),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header Row: Cover thumbnail, Title, Close Button
          Row(
            children: [
              // Cover
              ClipRRect(
                borderRadius: BorderRadius.circular(AppRadius.sm),
                child: Container(
                  width: 44,
                  height: 56,
                  color: Colors.white.withValues(alpha: 0.08),
                  child: widget.coverUrl != null && widget.coverUrl!.isNotEmpty
                      ? Image.network(
                          widget.coverUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (ctx, err, stack) => const Icon(
                            Icons.music_note_rounded,
                            color: AppColors.primary,
                            size: 24,
                          ),
                        )
                      : const Icon(
                          Icons.music_note_rounded,
                          color: AppColors.primary,
                          size: 24,
                        ),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),

              // Title and Chapter info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      widget.novelTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.caption.copyWith(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      widget.chapterTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.bodyM.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),

              // Close Button
              IconButton(
                icon: const Icon(Icons.close_rounded, size: 20),
                color: Colors.white.withValues(alpha: 0.6),
                tooltip: 'Đóng trình phát',
                onPressed: () {
                  _player.stop();
                  widget.onClose();
                },
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.xs),

          // If audio has not been generated yet: Show "Sinh giọng đọc AI" button (like Frontend_web_backup)
          if (!hasAudio) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
              child: SizedBox(
                width: double.infinity,
                height: 42,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1DB954), // Spotify green
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.full),
                    ),
                    elevation: 0,
                  ),
                  onPressed: _isGenerating ? null : _handleGenerateAudio,
                  icon: _isGenerating
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.black,
                          ),
                        )
                      : const Icon(Icons.auto_awesome_rounded, size: 18),
                  label: Text(
                    _isGenerating ? 'Đang sinh giọng đọc AI...' : 'Sinh giọng đọc AI (Google WaveNet)',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ),
            ),
          ] else ...[
            // Seek bar and timing
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: SliderTheme(
                data: SliderTheme.of(context).copyWith(
                  trackHeight: 3,
                  thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                  overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
                  activeTrackColor: const Color(0xFF1DB954),
                  inactiveTrackColor: Colors.white.withValues(alpha: 0.15),
                  thumbColor: const Color(0xFF1DB954),
                ),
                child: Slider(
                  value: _position.inMilliseconds
                      .toDouble()
                      .clamp(0.0, _duration.inMilliseconds.toDouble()),
                  min: 0,
                  max: _duration.inMilliseconds.toDouble() > 0
                      ? _duration.inMilliseconds.toDouble()
                      : 1.0,
                  onChanged: (val) {
                    _player.seek(Duration(milliseconds: val.round()));
                  },
                ),
              ),
            ),

            // Time Row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _formatTime(_position),
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.white.withValues(alpha: 0.6),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    '-${_formatTime(remaining)}',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.white.withValues(alpha: 0.6),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 2),

            // Control Buttons: Prev Chapter, Play/Pause, Next Chapter, Mute
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                // Prev Chapter
                IconButton(
                  icon: const Icon(Icons.skip_previous_rounded),
                  color: widget.hasPrevChapter
                      ? Colors.white
                      : Colors.white.withValues(alpha: 0.3),
                  iconSize: 28,
                  tooltip: 'Chương trước',
                  onPressed: widget.hasPrevChapter
                      ? () {
                          _player.stop();
                          widget.onPrevChapter();
                        }
                      : null,
                ),

                // Rewind 15s
                IconButton(
                  icon: const Icon(Icons.replay_10_rounded),
                  color: Colors.white.withValues(alpha: 0.8),
                  iconSize: 22,
                  tooltip: 'Tua lại 10s',
                  onPressed: () {
                    final target = _position - const Duration(seconds: 10);
                    _player.seek(target < Duration.zero ? Duration.zero : target);
                  },
                ),

                // Play / Pause Circle Button
                Container(
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color(0xFF1DB954),
                  ),
                  child: IconButton(
                    icon: Icon(
                      _isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                      color: Colors.black,
                    ),
                    iconSize: 32,
                    tooltip: _isPlaying ? 'Tạm dừng' : 'Phát',
                    onPressed: _togglePlayPause,
                  ),
                ),

                // Forward 10s
                IconButton(
                  icon: const Icon(Icons.forward_10_rounded),
                  color: Colors.white.withValues(alpha: 0.8),
                  iconSize: 22,
                  tooltip: 'Tua tới 10s',
                  onPressed: () {
                    final target = _position + const Duration(seconds: 10);
                    _player.seek(target > _duration ? _duration : target);
                  },
                ),

                // Next Chapter
                IconButton(
                  icon: const Icon(Icons.skip_next_rounded),
                  color: widget.hasNextChapter
                      ? Colors.white
                      : Colors.white.withValues(alpha: 0.3),
                  iconSize: 28,
                  tooltip: 'Chương sau',
                  onPressed: widget.hasNextChapter
                      ? () {
                          _player.stop();
                          widget.onNextChapter();
                        }
                      : null,
                ),

                // Volume / Mute
                IconButton(
                  icon: Icon(
                    _isMuted ? Icons.volume_off_rounded : Icons.volume_up_rounded,
                    size: 20,
                  ),
                  color: Colors.white.withValues(alpha: 0.7),
                  tooltip: _isMuted ? 'Bật âm thanh' : 'Tắt âm',
                  onPressed: () {
                    setState(() {
                      _isMuted = !_isMuted;
                      _player.setVolume(_isMuted ? 0.0 : _volume);
                    });
                  },
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
