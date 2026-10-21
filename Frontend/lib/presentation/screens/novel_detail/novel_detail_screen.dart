import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../bloc/bookmark/bookmark_bloc.dart';
import '../../../bloc/bookmark/bookmark_event.dart';
import '../../../bloc/bookmark/bookmark_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_tokens.dart';
import '../../../data/models/chapter_model.dart';
import '../../../data/models/novel_model.dart';
import '../../../data/repositories/bookmark_repository.dart';
import '../../../data/repositories/chapter_repository.dart';
import '../../../data/repositories/novel_repository.dart';
import '../../widgets/chapter_badge.dart';
import '../reader/reader_screen.dart';

class NovelDetailScreen extends StatefulWidget {
  final dynamic novelId;

  const NovelDetailScreen({super.key, required this.novelId});

  @override
  State<NovelDetailScreen> createState() => _NovelDetailScreenState();
}

class _NovelDetailScreenState extends State<NovelDetailScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  NovelModel? _novel;
  List<ChapterModel> _chapters = [];
  bool _isFavorite = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final novelRepo = context.read<NovelRepository>();
      final chapterRepo = context.read<ChapterRepository>();
      final bookmarkRepo = context.read<BookmarkRepository>();

      final novel = await novelRepo.getNovelDetail(widget.novelId);
      final chapters = await chapterRepo.getChapters(widget.novelId);
      final bookmark = await bookmarkRepo.getBookmark(widget.novelId);

      if (mounted) {
        setState(() {
          _novel = novel;
          _chapters = chapters;
          _isFavorite = bookmark?.isFavorite ?? false;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
          _isLoading = false;
        });
      }
    }
  }

  void _toggleBookmark() {
    setState(() {
      _isFavorite = !_isFavorite;
    });
    context.read<BookmarkBloc>().add(
      ToggleBookmarkEvent(novelId: widget.novelId, isFavorite: _isFavorite),
    );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppColors.textPrimary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        content: Text(
          _isFavorite
              ? 'Đã thêm truyện vào Tủ sách của bạn'
              : 'Đã xóa truyện khỏi Tủ sách',
          style: AppTypography.bodyM.copyWith(color: AppColors.surface),
        ),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  void _openChapter(ChapterModel chapter) {
    if (_novel == null) return;
    Navigator.of(context)
        .push(
          MaterialPageRoute(
            builder: (_) => ReaderScreen(
              novelId: widget.novelId,
              chapterId: chapter.id,
              novelTitle: _novel!.title,
              chaptersList: _chapters,
            ),
          ),
        )
        .then((_) {
          // Reload on pop to refresh read counts or unlocks
          _loadData();
        });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    if (_errorMessage != null || _novel == null) {
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
                    'Không thể tải thông tin truyện',
                    style: AppTypography.h3,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    _errorMessage ?? 'Đã có lỗi xảy ra, vui lòng thử lại.',
                    style: AppTypography.caption,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  ElevatedButton.icon(
                    onPressed: _loadData,
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

    final novel = _novel!;

    return BlocListener<BookmarkBloc, BookmarkState>(
      listener: (context, state) {
        if (state is BookmarkError) {
          setState(() {
            _isFavorite = !_isFavorite;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
              content: Text(state.message),
            ),
          );
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: CustomScrollView(
        slivers: [
          // App Bar on paper background
          SliverAppBar(
            pinned: true,
            elevation: AppElevation.level0,
            scrolledUnderElevation: AppElevation.level1,
            backgroundColor: AppColors.background,
            foregroundColor: AppColors.textPrimary,
            title: Text(
              novel.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.h3,
            ),
            actions: [
              IconButton(
                icon: Icon(
                  _isFavorite
                      ? Icons.bookmark_rounded
                      : Icons.bookmark_border_rounded,
                  color: _isFavorite
                      ? AppColors.primary
                      : AppColors.textPrimary,
                  size: AppIconSizes.lg,
                ),
                tooltip: _isFavorite
                    ? 'Bỏ lưu khỏi Tủ sách'
                    : 'Lưu vào Tủ sách',
                onPressed: _toggleBookmark,
              ),
              const SizedBox(width: AppSpacing.xs),
            ],
          ),

          // Header: Book cover + Metadata on vintage paper canvas
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: AppSpacing.sm),
                  // Book Cover & Info block
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Book Cover with 8px radius and subtle shadow
                      Container(
                        width: 115,
                        height: 165,
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(AppRadius.md),
                          boxShadow: AppElevation.cardShadow,
                          border: Border.all(
                            color: AppColors.divider,
                            width: 0.8,
                          ),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: novel.coverImageUrl.isNotEmpty
                            ? CachedNetworkImage(
                                imageUrl: novel.coverImageUrl,
                                fit: BoxFit.cover,
                                placeholder: (_, _) => Container(
                                  color: AppColors.background.withValues(
                                    alpha: 0.4,
                                  ),
                                  child: const Center(
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                                errorWidget: (_, _, _) =>
                                    _buildCoverPlaceholder(),
                              )
                            : _buildCoverPlaceholder(),
                      ),
                      const SizedBox(width: AppSpacing.md),

                      // Title & Authorship info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Book Title (Serif H1 26px)
                            Text(
                              novel.title,
                              style: AppTypography.h1.copyWith(
                                color: AppColors.textPrimary,
                                height: 1.25,
                              ),
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: AppSpacing.sm),

                            // Author
                            Row(
                              children: [
                                const Icon(
                                  Icons.edit_note_rounded,
                                  size: AppIconSizes.sm,
                                  color: AppColors.primary,
                                ),
                                const SizedBox(width: AppSpacing.xs),
                                Expanded(
                                  child: Text(
                                    novel.authorName.isNotEmpty
                                        ? novel.authorName
                                        : 'Đang cập nhật',
                                    style: AppTypography.bodyM.copyWith(
                                      color: AppColors.textSecondary,
                                      fontWeight: FontWeight.w600,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.sm),

                            // Status badge pill
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.sm,
                                vertical: AppSpacing.xs,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(
                                  AppRadius.full,
                                ),
                                border: Border.all(color: AppColors.divider),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 6,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: novel.status == 'ONGOING'
                                          ? AppColors.success
                                          : AppColors.info,
                                    ),
                                  ),
                                  const SizedBox(width: AppSpacing.xs),
                                  Flexible(
                                    child: Text(
                                      novel.status == 'ONGOING'
                                          ? 'Đang ra'
                                          : 'Hoàn thành',
                                      style: AppTypography.overline.copyWith(
                                        color: AppColors.textPrimary,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Meta stats container
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.sm,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      boxShadow: AppElevation.cardShadow,
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Expanded(
                          child: _buildStatColumn(
                            '${novel.chapterCount}',
                            'Chương',
                          ),
                        ),
                        Container(
                          width: 1,
                          height: 28,
                          color: AppColors.divider,
                        ),
                        Expanded(
                          child: _buildStatColumn(
                            '${novel.viewCount}',
                            'Lượt đọc',
                          ),
                        ),
                        Container(
                          width: 1,
                          height: 28,
                          color: AppColors.divider,
                        ),
                        Expanded(
                          child: _buildStatColumn(
                            novel.status == 'ONGOING' ? 'Đang ra' : 'Đã hoàn',
                            'Tiến độ',
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Categories tags
                  if (novel.categories.isNotEmpty) ...[
                    Wrap(
                      spacing: AppSpacing.sm,
                      runSpacing: AppSpacing.sm,
                      children: novel.categories
                          .map(
                            (c) => Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.sm,
                                vertical: AppSpacing.xs,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(
                                  AppRadius.full,
                                ),
                                border: Border.all(
                                  color: AppColors.divider,
                                  width: 1.0,
                                ),
                              ),
                              child: Text(
                                c,
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: AppSpacing.md),
                  ],

                  // Action Buttons: Responsive row/column for Read & Bookmark
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final isNarrow = constraints.maxWidth < 340;

                      final readBtn = ConstrainedBox(
                        constraints: const BoxConstraints(minHeight: 48),
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
                          icon: const Icon(
                            Icons.menu_book_rounded,
                            size: AppIconSizes.md,
                          ),
                          label: Text(
                            'Đọc từ đầu',
                            style: AppTypography.button.copyWith(
                              color: AppColors.surface,
                            ),
                          ),
                          onPressed: _chapters.isNotEmpty
                              ? () => _openChapter(_chapters.first)
                              : null,
                        ),
                      );

                      final bookmarkBtn = ConstrainedBox(
                        constraints: const BoxConstraints(minHeight: 48),
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            backgroundColor: AppColors.surface,
                            foregroundColor: _isFavorite
                                ? AppColors.primary
                                : AppColors.textPrimary,
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md,
                              vertical: AppSpacing.sm,
                            ),
                            side: BorderSide(
                              color: _isFavorite
                                  ? AppColors.primary
                                  : AppColors.divider,
                              width: 1.2,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(AppRadius.md),
                            ),
                          ),
                          icon: Icon(
                            _isFavorite
                                ? Icons.bookmark_rounded
                                : Icons.bookmark_border_rounded,
                            color: _isFavorite
                                ? AppColors.primary
                                : AppColors.textSecondary,
                            size: AppIconSizes.md,
                          ),
                          label: Text(
                            _isFavorite ? 'Đã lưu' : 'Tủ sách',
                            style: AppTypography.button.copyWith(
                              color: _isFavorite
                                  ? AppColors.primary
                                  : AppColors.textPrimary,
                            ),
                          ),
                          onPressed: _toggleBookmark,
                        ),
                      );

                      if (isNarrow) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            readBtn,
                            const SizedBox(height: AppSpacing.sm),
                            bookmarkBtn,
                          ],
                        );
                      }

                      return Row(
                        children: [
                          Expanded(child: readBtn),
                          const SizedBox(width: AppSpacing.sm),
                          bookmarkBtn,
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Description section
                  Text('Giới thiệu tác phẩm', style: AppTypography.h2),
                  const SizedBox(height: AppSpacing.sm),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: Text(
                      novel.description.isNotEmpty
                          ? novel.description
                          : 'Chưa có thông tin giới thiệu.',
                      style: AppTypography.bodyM.copyWith(
                        height: 1.6,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Chapters Section Header (No unnecessary Row)
                  Text(
                    'Danh sách chương (${_chapters.length})',
                    style: AppTypography.h2,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                ],
              ),
            ),
          ),

          // Chapter List (SliverList)
          if (_chapters.isEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: Center(
                    child: Text(
                      'Tác phẩm này chưa có chương nào được đăng tải.',
                      style: AppTypography.caption,
                    ),
                  ),
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate((context, index) {
                  final chapter = _chapters[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: Material(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(AppRadius.md),
                        hoverColor: AppColors.textPrimary.withValues(
                          alpha: 0.05,
                        ),
                        splashColor: AppColors.primary.withValues(alpha: 0.1),
                        onTap: () => _openChapter(chapter),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.md,
                            vertical: AppSpacing.sm,
                          ),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            border: Border.all(color: AppColors.divider),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      chapter.title,
                                      style: AppTypography.bodyM.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: AppSpacing.xs),
                                    Text(
                                      'Chương ${chapter.chapterNumber} • ${chapter.viewCount} lượt xem',
                                      style: AppTypography.caption.copyWith(
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: AppSpacing.sm),

                              // 3 Distinction Badges (Requirement 4 & 6)
                              _buildChapterBadge(chapter),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                }, childCount: _chapters.length),
              ),
            ),
          const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xl2)),
        ],
      ),
    ),
  );
  }

  Widget _buildChapterBadge(ChapterModel chapter) {
    return ChapterBadge(chapter: chapter);
  }

  Widget _buildCoverPlaceholder() {
    return Container(
      color: AppColors.background.withValues(alpha: 0.5),
      child: Center(
        child: Icon(
          Icons.auto_stories_outlined,
          size: AppIconSizes.xl + 8,
          color: AppColors.textMuted,
        ),
      ),
    );
  }

  Widget _buildStatColumn(String val, String label) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          val,
          textAlign: TextAlign.center,
          style: AppTypography.h3.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          label,
          textAlign: TextAlign.center,
          style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
        ),
      ],
    );
  }
}
