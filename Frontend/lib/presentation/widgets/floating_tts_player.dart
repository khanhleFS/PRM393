import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_tokens.dart';

enum TtsState { playing, paused, stopped }

/// Shared chunking helper to ensure ReaderScreen and FloatingTtsPlayer
/// segment chapter text identically for sentence/paragraph highlighting.
class TtsChunkHelper {
  static List<String> splitIntoChunks(String rawText) {
    final text = rawText.replaceAll('\r\n', '\n').trim();
    if (text.isEmpty) return [];

    final paragraphs = text.split(RegExp(r'\n+'));
    final List<String> list = [];

    for (final p in paragraphs) {
      final trimmed = p.trim();
      if (trimmed.isEmpty) continue;

      if (trimmed.length > 200) {
        final sentences = trimmed.split(RegExp(r'(?<=[.?!;…])\s+'));
        for (final s in sentences) {
          final sTrim = s.trim();
          if (sTrim.isNotEmpty) list.add(sTrim);
        }
      } else {
        list.add(trimmed);
      }
    }
    return list.isEmpty ? [text] : list;
  }
}

class FloatingTtsPlayer extends StatefulWidget {
  final String novelTitle;
  final String chapterTitle;
  final String content;
  final bool hasPrevChapter;
  final bool hasNextChapter;
  final VoidCallback onPrevChapter;
  final VoidCallback onNextChapter;
  final VoidCallback onClose;

  // Theme integration to match reader color scheme
  final Color? backgroundColor;
  final Color? textColor;
  final Color? borderColor;

  // Real-time synchronization of currently spoken chunk with reader screen
  final ValueChanged<int>? onChunkChanged;
  final int? seekToChunkIndex;

  const FloatingTtsPlayer({
    super.key,
    required this.novelTitle,
    required this.chapterTitle,
    required this.content,
    required this.hasPrevChapter,
    required this.hasNextChapter,
    required this.onPrevChapter,
    required this.onNextChapter,
    required this.onClose,
    this.backgroundColor,
    this.textColor,
    this.borderColor,
    this.onChunkChanged,
    this.seekToChunkIndex,
  });

  @override
  State<FloatingTtsPlayer> createState() => _FloatingTtsPlayerState();
}

class _FloatingTtsPlayerState extends State<FloatingTtsPlayer> {
  late final FlutterTts _flutterTts;

  TtsState _ttsState = TtsState.stopped;
  List<String> _chunks = [];
  int _currentChunkIndex = 0;
  String? _errorMessage;
  String _activeVoiceInfo = 'Tiếng Việt';

  // Speeds: 0.8x, 1.0x, 1.25x, 1.5x
  static const List<double> _speeds = [0.8, 1.0, 1.25, 1.5];
  int _speedIndex = 1; // Default 1.0x

  @override
  void initState() {
    super.initState();
    _initTts();
  }

  Future<void> _initTts() async {
    _flutterTts = FlutterTts();

    try {
      // Check language availability
      final isViAvailable = await _flutterTts.isLanguageAvailable('vi-VN');
      if (isViAvailable == true || isViAvailable == 1) {
        await _flutterTts.setLanguage('vi-VN');
        _activeVoiceInfo = 'vi-VN';
      } else {
        final isShortViAvailable = await _flutterTts.isLanguageAvailable('vi');
        if (isShortViAvailable == true || isShortViAvailable == 1) {
          await _flutterTts.setLanguage('vi');
          _activeVoiceInfo = 'vi';
        } else {
          _activeVoiceInfo = 'Mặc định máy';
        }
      }

      await _flutterTts.setVolume(1.0);
      await _flutterTts.setPitch(1.0);
      await _applySpeechRate(_speeds[_speedIndex]);

      _flutterTts.setStartHandler(() {
        if (mounted) {
          setState(() {
            _ttsState = TtsState.playing;
            _errorMessage = null;
          });
        }
      });

      _flutterTts.setCompletionHandler(() {
        _onChunkCompleted();
      });

      _flutterTts.setErrorHandler((dynamic msg) {
        debugPrint('[TTS] Error: $msg');
        if (mounted) {
          setState(() {
            _ttsState = TtsState.stopped;
            _errorMessage = 'Trình duyệt/thiết bị chưa hỗ trợ: $msg';
          });
        }
      });

      _flutterTts.setCancelHandler(() {
        if (mounted) setState(() => _ttsState = TtsState.stopped);
      });

      _flutterTts.setPauseHandler(() {
        if (mounted) setState(() => _ttsState = TtsState.paused);
      });

      _flutterTts.setContinueHandler(() {
        if (mounted) setState(() => _ttsState = TtsState.playing);
      });
    } catch (e) {
      debugPrint('[TTS] Init exception: $e');
      if (mounted) {
        setState(() {
          if (e.toString().contains('MissingPluginException')) {
            _errorMessage =
                'Cần dừng (Ctrl+C) và chạy lại "flutter run -d chrome" trên terminal để kích hoạt plugin!';
          } else {
            _errorMessage = 'Lỗi khởi tạo giọng đọc: $e';
          }
        });
      }
    }

    _prepareChunksAndPlay();
  }

  void _prepareChunksAndPlay() {
    _chunks = TtsChunkHelper.splitIntoChunks(widget.content);
    _currentChunkIndex = 0;
    widget.onChunkChanged?.call(0);
    if (_chunks.isNotEmpty) {
      _speakCurrentChunk();
    }
  }

  @override
  void didUpdateWidget(covariant FloatingTtsPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.chapterTitle != oldWidget.chapterTitle ||
        widget.content != oldWidget.content) {
      _flutterTts.stop();
      _prepareChunksAndPlay();
    } else if (widget.seekToChunkIndex != null &&
        widget.seekToChunkIndex != oldWidget.seekToChunkIndex &&
        widget.seekToChunkIndex != _currentChunkIndex) {
      _seekChunk(widget.seekToChunkIndex!);
    }
  }

  @override
  void dispose() {
    _flutterTts.stop();
    super.dispose();
  }

  Future<void> _applySpeechRate(double speed) async {
    final rate = kIsWeb ? speed * 0.9 : 0.5 * speed;
    await _flutterTts.setSpeechRate(rate.clamp(0.1, 1.0));
  }

  Future<void> _speakCurrentChunk() async {
    if (_chunks.isEmpty || _currentChunkIndex >= _chunks.length) return;
    final textToSpeak = _chunks[_currentChunkIndex];
    if (textToSpeak.trim().isEmpty) {
      _onChunkCompleted();
      return;
    }

    try {
      await _flutterTts.stop();
      if (mounted) {
        setState(() {
          _ttsState = TtsState.playing;
          _errorMessage = null;
        });
      }
      final result = await _flutterTts.speak(textToSpeak);
      debugPrint('[TTS] Speaking chunk $_currentChunkIndex result: $result');
      if (result == 0 && mounted) {
        setState(() {
          _errorMessage =
              'Trình duyệt đang chặn tự động phát âm thanh. Vui lòng bấm vào nút Play (Tam giác).';
        });
      }
    } catch (e) {
      debugPrint('[TTS] Speak error: $e');
      if (mounted) {
        setState(() {
          _ttsState = TtsState.stopped;
          if (e.toString().contains('MissingPluginException')) {
            _errorMessage =
                'Cần tắt terminal (Ctrl+C) và chạy lại "flutter run -d chrome" để nạp plugin!';
          } else {
            _errorMessage = 'Lỗi phát âm thanh: $e';
          }
        });
      }
    }
  }

  void _onChunkCompleted() {
    if (!mounted) return;
    if (_ttsState != TtsState.playing) return;

    if (_currentChunkIndex + 1 < _chunks.length) {
      setState(() {
        _currentChunkIndex++;
      });
      widget.onChunkChanged?.call(_currentChunkIndex);
      _speakCurrentChunk();
    } else {
      setState(() {
        _ttsState = TtsState.stopped;
      });
    }
  }

  Future<void> _togglePlayPause() async {
    if (_ttsState == TtsState.playing) {
      await _flutterTts.stop();
      if (mounted) setState(() => _ttsState = TtsState.paused);
    } else {
      _speakCurrentChunk();
    }
  }

  Future<void> _seekChunk(int newIndex) async {
    final int target = newIndex.clamp(0, max(0, _chunks.length - 1)).toInt();
    await _flutterTts.stop();
    setState(() {
      _currentChunkIndex = target;
    });
    widget.onChunkChanged?.call(target);
    _speakCurrentChunk();
  }

  void _cycleSpeed() {
    setState(() {
      _speedIndex = (_speedIndex + 1) % _speeds.length;
    });
    _applySpeechRate(_speeds[_speedIndex]);
  }

  @override
  Widget build(BuildContext context) {
    final isPlaying = _ttsState == TtsState.playing;
    final totalChunks = _chunks.length;
    final progress = totalChunks > 0
        ? (_currentChunkIndex / totalChunks).clamp(0.0, 1.0)
        : 0.0;
    final currentText = (_chunks.isNotEmpty &&
            _currentChunkIndex < _chunks.length)
        ? _chunks[_currentChunkIndex]
        : 'Sẵn sàng đọc...';

    // Theme values (matching reader theme)
    final themeBg = widget.backgroundColor ?? const Color(0xFF1E1E28);
    final themeText = widget.textColor ?? Colors.white;
    final themeBorder = widget.borderColor ?? AppColors.primary.withValues(alpha: 0.3);

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: themeBg.withValues(alpha: 0.98),
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(AppRadius.lg),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
        border: Border(
          top: BorderSide(
            color: themeBorder,
            width: 1.5,
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header Row: Play/Pause Button + Chapter Info + Speed + Close
              Row(
                children: [
                  // Play / Pause Button
                  GestureDetector(
                    onTap: _togglePlayPause,
                    child: Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [
                            AppColors.primary,
                            AppColors.primaryLight,
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.4),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Icon(
                        isPlaying
                            ? Icons.pause_rounded
                            : Icons.play_arrow_rounded,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),

                  // Title and current sentence snippet
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                widget.chapterTitle,
                                style: AppTypography.caption.copyWith(
                                  color: themeText,
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'TTS: $_activeVoiceInfo',
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.primary,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 3),
                        // Visual highlighting of what is currently being read
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(
                              color: AppColors.primary.withValues(alpha: 0.25),
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.record_voice_over_rounded,
                                size: 12,
                                color: AppColors.primary,
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  currentText,
                                  style: AppTypography.caption.copyWith(
                                    color: themeText,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 11,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(width: AppSpacing.xs),

                  // Speed toggle button
                  InkWell(
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                    onTap: _cycleSpeed,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.xs + 2,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: themeText.withValues(alpha: 0.25),
                        ),
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: Text(
                        '${_speeds[_speedIndex]}x',
                        style: AppTypography.caption.copyWith(
                          color: themeText,
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(width: AppSpacing.xs),

                  // Close button
                  IconButton(
                    icon: Icon(
                      Icons.close_rounded,
                      color: themeText.withValues(alpha: 0.7),
                      size: AppIconSizes.sm,
                    ),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    onPressed: () {
                      _flutterTts.stop();
                      widget.onClose();
                    },
                  ),
                ],
              ),

              // Error/Warning message banner
              if (_errorMessage != null) ...[
                const SizedBox(height: AppSpacing.xs),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                    border: Border.all(
                      color: AppColors.error.withValues(alpha: 0.4),
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.info_outline_rounded,
                        color: Colors.amber,
                        size: 16,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: AppTypography.caption.copyWith(
                            color: const Color(0xFFFFF3CD),
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: AppSpacing.xs),

              // Progress Bar & Chunk Counter
              Row(
                children: [
                  Text(
                    totalChunks > 0
                        ? '${_currentChunkIndex + 1}/$totalChunks'
                        : '0/0',
                    style: AppTypography.caption.copyWith(
                      color: themeText.withValues(alpha: 0.6),
                      fontSize: 11,
                    ),
                  ),
                  Expanded(
                    child: SliderTheme(
                      data: SliderTheme.of(context).copyWith(
                        trackHeight: 3.0,
                        thumbShape: const RoundSliderThumbShape(
                          enabledThumbRadius: 5.0,
                        ),
                        overlayShape: const RoundSliderOverlayShape(
                          overlayRadius: 10.0,
                        ),
                        activeTrackColor: AppColors.primary,
                        inactiveTrackColor: themeText.withValues(alpha: 0.18),
                        thumbColor: AppColors.primary,
                      ),
                      child: Slider(
                        value: totalChunks > 1
                            ? _currentChunkIndex.toDouble()
                            : 0.0,
                        min: 0.0,
                        max: max(1.0, (totalChunks - 1).toDouble()),
                        onChanged: (val) {
                          _seekChunk(val.round());
                        },
                      ),
                    ),
                  ),
                  Text(
                    '${(progress * 100).toInt()}%',
                    style: AppTypography.caption.copyWith(
                      color: themeText.withValues(alpha: 0.6),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
