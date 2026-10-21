import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_event.dart';
import '../../../bloc/auth/auth_state.dart';
import '../../../bloc/bookmark/bookmark_bloc.dart';
import '../../../bloc/bookmark/bookmark_event.dart';
import '../../../bloc/reader/reader_bloc.dart';
import '../../../bloc/reader/reader_event.dart';
import '../../../bloc/reader/reader_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_tokens.dart';
import '../../../core/storage/local_storage.dart';
import '../../../data/models/chapter_model.dart';
import '../../../data/repositories/chapter_repository.dart';
import '../auth/login_screen.dart';
import '../coin/coin_shop_screen.dart';

class ReaderScreen extends StatelessWidget {
  final dynamic novelId;
  final dynamic chapterId;
  final String novelTitle;
  final List<ChapterModel>? chaptersList;

  const ReaderScreen({
    super.key,
    required this.novelId,
    required this.chapterId,
    required this.novelTitle,
    this.chaptersList,
  });

  @override
  Widget build(BuildContext context) {
    final authBloc = context.read<AuthBloc>();
    return BlocProvider(
      create: (context) =>
          ReaderBloc(
            chapterRepository: context.read<ChapterRepository>(),
            onChapterUnlocked: () {
              // Sync updated balance to AuthBloc so all screens reflect new coins
              authBloc.add(CheckAuthStatusEvent());
            },
          )..add(
            LoadChapterEvent(
              novelId: novelId,
              chapterId: chapterId,
              novelTitle: novelTitle,
              chaptersList: chaptersList,
            ),
          ),
      child: _ReaderView(
        novelId: novelId,
        chapterId: chapterId,
        novelTitle: novelTitle,
        chaptersList: chaptersList,
      ),
    );
  }
}

class _ReaderView extends StatefulWidget {
  final dynamic novelId;
  final dynamic chapterId;
  final String novelTitle;
  final List<ChapterModel>? chaptersList;

  const _ReaderView({
    required this.novelId,
    required this.chapterId,
    required this.novelTitle,
    this.chaptersList,
  });

  @override
  State<_ReaderView> createState() => _ReaderViewState();
}

class _ReaderViewState extends State<_ReaderView> {
  final ScrollController _scrollController = ScrollController();
  String? _lastSyncedChapterId;

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToTop() {
    if (_scrollController.hasClients) {
      _scrollController.jumpTo(0);
    }
  }

  void _showSettingsModal(BuildContext context) {
    final readerBloc = context.read<ReaderBloc>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (modalCtx) {
        return ReaderSettingsModalContent(
          readerBloc: readerBloc,
          onClose: () => Navigator.pop(modalCtx),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ReaderBloc, ReaderState>(
      listener: (context, state) {
        if (state is ReaderLoaded) {
          final chapter = state.chapter;
          final authState = context.read<AuthBloc>().state;
          final isAuthenticated = authState is Authenticated ||
              (LocalStorage.getAccessToken()?.isNotEmpty ?? false);

          final hasValidContent =
              chapter.content != null && chapter.content!.trim().isNotEmpty;
          final isUnlockedAndReadable = !chapter.isLocked && hasValidContent;

          if (isAuthenticated && isUnlockedAndReadable) {
            final currentChapterKey = chapter.id.toString();
            if (_lastSyncedChapterId != currentChapterKey) {
              _lastSyncedChapterId = currentChapterKey;

              int? percent;
              final list = state.chaptersList.isNotEmpty
                  ? state.chaptersList
                  : (widget.chaptersList ?? []);
              if (list.isNotEmpty) {
                final index = list.indexWhere(
                  (c) => c.id.toString() == currentChapterKey,
                );
                if (index != -1) {
                  percent = (((index + 1) / list.length) * 100).round();
                  if (percent > 100) percent = 100;
                }
              }

              context.read<BookmarkBloc>().add(
                    UpdateReadingProgressEvent(
                      novelId: chapter.novelId,
                      lastChapterId: chapter.id,
                      readingProgressPercent: percent,
                    ),
                  );
            }
          }
        } else if (state is ReaderError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              content: Text(
                state.message,
                style: AppTypography.bodyM.copyWith(color: Colors.white),
              ),
            ),
          );
        }
      },
      builder: (context, state) {
        if (state is ReaderLoading || state is ReaderInitial) {
          return const Scaffold(
            backgroundColor: AppColors.background,
            body: Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
          );
        }

        if (state is ReaderError) {
          return Scaffold(
            backgroundColor: AppColors.background,
            appBar: AppBar(backgroundColor: AppColors.background, elevation: 0),
            body: Center(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    boxShadow: AppElevation.cardShadow,
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.error_outline_rounded,
                        color: AppColors.error,
                        size: AppIconSizes.xl + 12,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Text(
                        'Không thể tải nội dung chương',
                        style: AppTypography.h3,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        state.message,
                        style: AppTypography.caption,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      // Dispatches RetryChapterEvent to retry the exact failed chapter
                      ElevatedButton.icon(
                        onPressed: () {
                          context.read<ReaderBloc>().add(
                            const RetryChapterEvent(),
                          );
                        },
                        icon: const Icon(
                          Icons.refresh_rounded,
                          size: AppIconSizes.sm,
                        ),
                        label: const Text('Thử lại'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }

        if (state is ReaderLoaded) {
          final chapter = state.chapter;

          // Theme colors
          Color bgColor;
          Color textColor;
          Color cardBg;
          Color borderColor;

          if (state.readerTheme == 'night') {
            bgColor = AppColors.nightBg;
            textColor = AppColors.nightText;
            cardBg = AppColors.nightCard;
            borderColor = Colors.white.withValues(alpha: 0.12);
          } else if (state.readerTheme == 'light') {
            bgColor = AppColors.lightBg;
            textColor = AppColors.lightText;
            cardBg = Colors.white;
            borderColor = AppColors.divider;
          } else {
            // Default Paper (#DDDBBB)
            bgColor = AppColors.paperBg;
            textColor = AppColors.paperText;
            cardBg = AppColors.surface;
            borderColor = AppColors.divider;
          }

          final isSerif =
              state.fontFamily != 'Arimo' &&
              state.fontFamily != 'Plus Jakarta Sans';

          final TextStyle readingTextStyle = isSerif
              ? GoogleFonts.tinos(
                  fontSize: state.fontSize,
                  color: textColor,
                  height: 1.55,
                )
              : GoogleFonts.arimo(
                  fontSize: state.fontSize,
                  color: textColor,
                  height: 1.55,
                );

          return Scaffold(
            backgroundColor: bgColor,
            appBar: AppBar(
              backgroundColor: bgColor,
              elevation: 0,
              iconTheme: IconThemeData(color: textColor),
              title: Text(
                state.novelTitle,
                style: AppTypography.h3.copyWith(
                  color: textColor,
                  fontWeight: FontWeight.w700,
                ),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.tune_rounded),
                  tooltip: 'Cài đặt giao diện',
                  onPressed: () => _showSettingsModal(context),
                ),
                const SizedBox(width: AppSpacing.xs),
              ],
            ),
            body: Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.md,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Chapter Title (Times New Roman / Tinos Serif)
                        Text(
                          chapter.title,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.tinos(
                            fontSize: state.fontSize + 6,
                            fontWeight: FontWeight.w700,
                            color: textColor,
                            height: 1.25,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          'Chương ${chapter.chapterNumber}',
                          textAlign: TextAlign.center,
                          style: AppTypography.caption.copyWith(
                            color: textColor.withValues(alpha: 0.65),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.lg),

                        // If Chapter is locked: Show VIP Unlock Card
                        if (chapter.isLocked) ...[
                          _buildLockedChapterCard(
                            context,
                            chapter,
                            textColor,
                            cardBg,
                            borderColor,
                          ),
                        ] else ...[
                          // Anti-copy Protected Text
                          SelectionContainer.disabled(
                            child: Text(
                              chapter.content?.isNotEmpty ?? false
                                  ? chapter.content!
                                  : 'Nội dung chương trống.',
                              style: readingTextStyle,
                            ),
                          ),
                        ],
                        const SizedBox(height: AppSpacing.xl2),
                      ],
                    ),
                  ),
                ),

                // Bottom Navigation Bar for previous/next chapters
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: bgColor,
                    border: Border(top: BorderSide(color: borderColor)),
                  ),
                  child: SafeArea(
                    top: false,
                    child: Row(
                      children: [
                        // Previous Chapter Button (Outline/Ghost)
                        Expanded(
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(minHeight: 44),
                            child: OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                backgroundColor: Colors.transparent,
                                foregroundColor: textColor,
                                disabledForegroundColor: textColor.withValues(
                                  alpha: 0.35,
                                ),
                                side: BorderSide(
                                  color: state.prevChapter != null
                                      ? borderColor
                                      : borderColor.withValues(alpha: 0.4),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.sm,
                                  vertical: AppSpacing.sm,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(
                                    AppRadius.md,
                                  ),
                                ),
                              ),
                              icon: const Icon(
                                Icons.arrow_back_rounded,
                                size: AppIconSizes.sm,
                              ),
                              label: Text(
                                'Chương trước',
                                style: AppTypography.button.copyWith(
                                  fontSize: 13,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                              onPressed: state.prevChapter != null
                                  ? () {
                                      _scrollToTop();
                                      context.read<ReaderBloc>().add(
                                        LoadChapterEvent(
                                          novelId: state.prevChapter!.novelId,
                                          chapterId: state.prevChapter!.id,
                                          novelTitle: state.novelTitle,
                                          chaptersList: state.chaptersList,
                                        ),
                                      );
                                    }
                                  : null,
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),

                        // Next Chapter Button (Solid Primary)
                        Expanded(
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(minHeight: 44),
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: AppColors.surface,
                                disabledBackgroundColor: AppColors.primary
                                    .withValues(alpha: 0.35),
                                disabledForegroundColor: AppColors.surface
                                    .withValues(alpha: 0.5),
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.sm,
                                  vertical: AppSpacing.sm,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(
                                    AppRadius.md,
                                  ),
                                ),
                              ),
                              icon: const Icon(
                                Icons.arrow_forward_rounded,
                                size: AppIconSizes.sm,
                              ),
                              label: Text(
                                'Chương sau',
                                style: AppTypography.button.copyWith(
                                  fontSize: 13,
                                  color: AppColors.surface,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                              onPressed: state.nextChapter != null
                                  ? () {
                                      _scrollToTop();
                                      context.read<ReaderBloc>().add(
                                        LoadChapterEvent(
                                          novelId: state.nextChapter!.novelId,
                                          chapterId: state.nextChapter!.id,
                                          novelTitle: state.novelTitle,
                                          chaptersList: state.chaptersList,
                                        ),
                                      );
                                    }
                                  : null,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        }

        return const Scaffold(
          backgroundColor: AppColors.background,
          body: Center(
            child: CircularProgressIndicator(color: AppColors.primary),
          ),
        );
      },
    );
  }

  Widget _buildLockedChapterCard(
    BuildContext context,
    ChapterModel chapter,
    Color textColor,
    Color cardBg,
    Color borderColor,
  ) {
    return LockedChapterCard(
      chapter: chapter,
      textColor: textColor,
      cardBg: cardBg,
      borderColor: borderColor,
    );
  }
}

/// Modal content for Reader settings (font size, font family, theme).
/// Designed to be responsive without overflows at 360/393dp and large text scales.
class ReaderSettingsModalContent extends StatelessWidget {
  final ReaderBloc readerBloc;
  final VoidCallback? onClose;

  const ReaderSettingsModalContent({
    super.key,
    required this.readerBloc,
    this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: readerBloc,
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.md,
            AppSpacing.sm,
            AppSpacing.md,
            AppSpacing.lg,
          ),
          child: BlocBuilder<ReaderBloc, ReaderState>(
            builder: (context, state) {
              if (state is! ReaderLoaded) {
                return const SizedBox(height: 100);
              }

              final isSerif =
                  state.fontFamily != 'Arimo' &&
                  state.fontFamily != 'Plus Jakarta Sans';

              final fontControl = Container(
                decoration: BoxDecoration(
                  color: AppColors.background.withValues(alpha: 0.35),
                  borderRadius: BorderRadius.circular(AppRadius.full),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(
                        Icons.remove_rounded,
                        size: AppIconSizes.md,
                      ),
                      onPressed: state.fontSize > 12
                          ? () {
                              readerBloc.add(
                                ChangeFontSizeEvent(state.fontSize - 2),
                              );
                            }
                          : null,
                    ),
                    Container(
                      constraints: const BoxConstraints(minWidth: 44),
                      alignment: Alignment.center,
                      child: Text(
                        '${state.fontSize.toInt()} px',
                        style: AppTypography.button.copyWith(
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(
                        Icons.add_rounded,
                        size: AppIconSizes.md,
                      ),
                      onPressed: state.fontSize < 32
                          ? () {
                              readerBloc.add(
                                ChangeFontSizeEvent(state.fontSize + 2),
                              );
                            }
                          : null,
                    ),
                  ],
                ),
              );

              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Drag handle
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.divider,
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                    ),
                  ),

                  // Modal Title (Wrapped in Expanded for responsiveness)
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Cài đặt giao diện đọc',
                          style: AppTypography.h3.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(
                          Icons.close_rounded,
                          size: AppIconSizes.md,
                          color: AppColors.textSecondary,
                        ),
                        onPressed: onClose ?? () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const Divider(height: AppSpacing.md),

                  // 1. Font Size Row (Responsive Layout via Wrap)
                  Wrap(
                    alignment: WrapAlignment.spaceBetween,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: AppSpacing.md,
                    runSpacing: AppSpacing.xs,
                    children: [
                      Text(
                        'Cỡ chữ',
                        style: AppTypography.bodyM.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      fontControl,
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // 2. Font Family (Kiểu chữ on separate row, choices wrapped below)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Kiểu chữ',
                        style: AppTypography.bodyM.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Wrap(
                        spacing: AppSpacing.sm,
                        runSpacing: AppSpacing.sm,
                        children: [
                          ChoiceChip(
                            key: const ValueKey('chip_font_serif'),
                            label: Text(
                              'Có chân (Serif)',
                              style: GoogleFonts.tinos(
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                                color: isSerif
                                    ? AppColors.surface
                                    : AppColors.textPrimary,
                              ),
                            ),
                            selected: isSerif,
                            selectedColor: AppColors.primary,
                            backgroundColor: AppColors.surface,
                            showCheckmark: false,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(AppRadius.md),
                              side: BorderSide(
                                color: isSerif
                                    ? AppColors.primary
                                    : AppColors.divider,
                              ),
                            ),
                            onSelected: (selected) {
                              if (selected) {
                                readerBloc.add(
                                  const ChangeFontFamilyEvent('Tinos'),
                                );
                              }
                            },
                          ),
                          ChoiceChip(
                            key: const ValueKey('chip_font_sans'),
                            label: Text(
                              'Không chân (Sans)',
                              style: GoogleFonts.arimo(
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                                color: !isSerif
                                    ? AppColors.surface
                                    : AppColors.textPrimary,
                              ),
                            ),
                            selected: !isSerif,
                            selectedColor: AppColors.primary,
                            backgroundColor: AppColors.surface,
                            showCheckmark: false,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(AppRadius.md),
                              side: BorderSide(
                                color: !isSerif
                                    ? AppColors.primary
                                    : AppColors.divider,
                              ),
                            ),
                            onSelected: (selected) {
                              if (selected) {
                                readerBloc.add(
                                  const ChangeFontFamilyEvent('Arimo'),
                                );
                              }
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // 3. Reader Theme Colors (Wrap to prevent overflow)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Màu nền',
                        style: AppTypography.bodyM.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Wrap(
                        spacing: AppSpacing.sm,
                        runSpacing: AppSpacing.sm,
                        children: [
                          _buildThemeButton(
                            label: 'Giấy',
                            bgColor: AppColors.paperBg,
                            textColor: AppColors.paperText,
                            isSelected: state.readerTheme == 'paper',
                            onTap: () {
                              readerBloc.add(
                                const ChangeReaderThemeEvent('paper'),
                              );
                            },
                          ),
                          _buildThemeButton(
                            label: 'Đêm',
                            bgColor: AppColors.nightBg,
                            textColor: AppColors.nightText,
                            isSelected: state.readerTheme == 'night',
                            onTap: () {
                              readerBloc.add(
                                const ChangeReaderThemeEvent('night'),
                              );
                            },
                          ),
                          _buildThemeButton(
                            label: 'Sáng',
                            bgColor: AppColors.lightBg,
                            textColor: AppColors.lightText,
                            isSelected: state.readerTheme == 'light',
                            onTap: () {
                              readerBloc.add(
                                const ChangeReaderThemeEvent('light'),
                              );
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildThemeButton({
    required String label,
    required Color bgColor,
    required Color textColor,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.xs + 2,
        ),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(AppRadius.full),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.divider,
            width: isSelected ? 2.0 : 1.0,
          ),
          boxShadow: isSelected ? AppElevation.cardShadow : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.transparent,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? AppColors.primary
                      : textColor.withValues(alpha: 0.5),
                  width: 1.5,
                ),
              ),
              child: isSelected
                  ? const Center(
                      child: Icon(Icons.check, size: 10, color: Colors.white),
                    )
                  : null,
            ),
            const SizedBox(width: AppSpacing.xs),
            Text(
              label,
              style: AppTypography.caption.copyWith(
                color: textColor,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// VIP Locked Chapter Card
/// Properly supports dark night mode text contrast as well as paper/light modes.
class LockedChapterCard extends StatelessWidget {
  final ChapterModel chapter;
  final Color textColor;
  final Color cardBg;
  final Color borderColor;

  const LockedChapterCard({
    super.key,
    required this.chapter,
    required this.textColor,
    required this.cardBg,
    required this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(
          color: AppColors.warning.withValues(alpha: 0.45),
          width: 1.2,
        ),
        boxShadow: AppElevation.cardShadow,
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.lock_rounded,
              size: AppIconSizes.xl,
              color: AppColors.warning,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Chương truyện VIP có tính phí',
            style: AppTypography.h3.copyWith(
              color: textColor,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Chương này được mã hóa bảo vệ bản quyền. Bạn cần dùng ${chapter.coinPrice} xu để mở khóa và đọc toàn bộ nội dung.',
            textAlign: TextAlign.center,
            style: AppTypography.bodyM.copyWith(
              color: textColor.withValues(alpha: 0.75),
              height: 1.45,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, authState) {
              if (authState is Authenticated) {
                final balance = authState.user.coinBalance;
                final canAfford = balance >= chapter.coinPrice;

                return Column(
                  children: [
                    // Coin Balance badge: supports wrapping & high contrast text using textColor
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.sm,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.warning.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(AppRadius.full),
                        border: Border.all(
                          color: AppColors.warning.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.monetization_on_rounded,
                            size: AppIconSizes.sm,
                            color: AppColors.warning,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          Flexible(
                            child: Text(
                              'Số dư của bạn: $balance xu',
                              style: AppTypography.button.copyWith(
                                color: textColor,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    if (canAfford)
                      ConstrainedBox(
                        constraints: const BoxConstraints(minHeight: 48),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: AppColors.surface,
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.md,
                                vertical: AppSpacing.sm,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(
                                  AppRadius.md,
                                ),
                              ),
                            ),
                            onPressed: () {
                              context.read<ReaderBloc>().add(
                                UnlockChapterEvent(
                                  novelId: chapter.novelId,
                                  chapterId: chapter.id,
                                ),
                              );
                            },
                            icon: const Icon(
                              Icons.lock_open_rounded,
                              size: AppIconSizes.md,
                            ),
                            label: Text(
                              'Mở khóa ngay (${chapter.coinPrice} xu)',
                              style: AppTypography.button.copyWith(
                                color: AppColors.surface,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ),
                      )
                    else
                      Column(
                        children: [
                          Text(
                            'Số xu hiện tại không đủ để mở khóa chương này',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.error,
                              fontWeight: FontWeight.w600,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          ConstrainedBox(
                            constraints: const BoxConstraints(minHeight: 48),
                            child: SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.warning,
                                  foregroundColor: AppColors.surface,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: AppSpacing.md,
                                    vertical: AppSpacing.sm,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(
                                      AppRadius.md,
                                    ),
                                  ),
                                ),
                                onPressed: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => const CoinShopScreen(),
                                    ),
                                  );
                                },
                                icon: const Icon(
                                  Icons.add_circle_outline_rounded,
                                  size: AppIconSizes.md,
                                ),
                                label: Text(
                                  'Nạp thêm xu',
                                  style: AppTypography.button.copyWith(
                                    color: AppColors.surface,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                  ],
                );
              }

              return Column(
                children: [
                  Text(
                    'Bạn cần đăng nhập tài khoản để mở khóa chương truyện',
                    style: AppTypography.bodyM.copyWith(
                      color: textColor.withValues(alpha: 0.7),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  ConstrainedBox(
                    constraints: const BoxConstraints(minHeight: 48),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: AppColors.surface,
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.md,
                            vertical: AppSpacing.sm,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                          ),
                        ),
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const LoginScreen(),
                            ),
                          );
                        },
                        icon: const Icon(
                          Icons.login_rounded,
                          size: AppIconSizes.md,
                        ),
                        label: Text(
                          'Đăng nhập ngay',
                          style: AppTypography.button.copyWith(
                            color: AppColors.surface,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
