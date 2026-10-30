import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_state.dart';
import '../../../bloc/bookmark/bookmark_bloc.dart';
import '../../../bloc/bookmark/bookmark_event.dart';
import '../../../bloc/bookmark/bookmark_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../data/models/bookmark_model.dart';
import '../auth/login_screen.dart';
import '../novel_detail/novel_detail_screen.dart';
import '../reader/reader_screen.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key});

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  @override
  void initState() {
    super.initState();
    context.read<BookmarkBloc>().add(FetchBookmarksEvent());
  }

  void _showRemoveConfirmDialog(BuildContext context, BookmarkModel item) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.roundedXl,
          side: const BorderSide(color: AppColors.divider, width: 0.8),
        ),
        title: Text(
          'Bỏ theo dõi tác phẩm?',
          style: AppTypography.h3,
        ),
        content: Text(
          'Bạn có chắc chắn muốn bỏ lưu tác phẩm "${item.novelTitle}" khỏi tủ sách cá nhân?',
          style: AppTypography.bodyM.copyWith(color: AppColors.textSecondary),
        ),
        actionsPadding: const EdgeInsets.fromLTRB(
          AppSpacing.md,
          0,
          AppSpacing.md,
          AppSpacing.md,
        ),
        actions: [
          OutlinedButton(
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.divider, width: 1.0),
              shape: RoundedRectangleBorder(
                borderRadius: AppRadius.roundedFull,
              ),
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
            ),
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(
              'Giữ lại',
              style: AppTypography.button.copyWith(color: AppColors.textDark),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: AppColors.surface,
              elevation: AppElevation.none,
              shape: RoundedRectangleBorder(
                borderRadius: AppRadius.roundedFull,
              ),
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              context.read<BookmarkBloc>().add(
                    ToggleBookmarkEvent(
                      novelId: item.novelId,
                      isFavorite: false,
                    ),
                  );
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: AppColors.textDark,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                    borderRadius: AppRadius.roundedMd,
                  ),
                  content: Text(
                    'Đã xóa khỏi tủ sách',
                    style: AppTypography.bodyM.copyWith(color: AppColors.surface),
                  ),
                ),
              );
            },
            child: Text(
              'Xóa',
              style: AppTypography.button.copyWith(color: AppColors.surface),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Tủ sách cá nhân',
          style: AppTypography.h2,
        ),
        backgroundColor: AppColors.background,
        elevation: AppElevation.none,
        scrolledUnderElevation: AppElevation.card,
        actions: [
          BlocBuilder<BookmarkBloc, BookmarkState>(
            builder: (context, state) {
              if (state is BookmarkLoaded && state.bookmarks.isNotEmpty) {
                return Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.md),
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: AppSpacing.xs,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: AppRadius.roundedFull,
                        border: Border.all(color: AppColors.divider, width: 0.8),
                      ),
                      child: Text(
                        '${state.bookmarks.length} tác phẩm',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                );
              }
              return const SizedBox();
            },
          ),
        ],
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, authState) {
          if (authState is! Authenticated) {
            return _buildUnauthenticatedState(context);
          }

          return BlocBuilder<BookmarkBloc, BookmarkState>(
            builder: (context, state) {
              if (state is BookmarkLoading || state is BookmarkInitial) {
                return _buildLoadingState();
              }

              if (state is BookmarkError) {
                return _buildErrorState(context, state.message);
              }

              if (state is BookmarkLoaded) {
                if (state.bookmarks.isEmpty) {
                  return _buildEmptyState();
                }

                return RefreshIndicator(
                  color: AppColors.primary,
                  backgroundColor: AppColors.surface,
                  onRefresh: () async {
                    context.read<BookmarkBloc>().add(FetchBookmarksEvent());
                  },
                  child: ListView.separated(
                    padding: AppSpacing.paddingMd,
                    itemCount: state.bookmarks.length,
                    separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
                    itemBuilder: (context, index) {
                      final item = state.bookmarks[index];
                      return _buildBookmarkCard(context, item);
                    },
                  ),
                );
              }

              return const SizedBox();
            },
          );
        },
      ),
    );
  }

  Widget _buildBookmarkCard(BuildContext context, BookmarkModel item) {
    final progress = (item.readingProgressPercent.clamp(0, 100)) / 100.0;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () async {
          final bookmarkBloc = context.read<BookmarkBloc>();
          await Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => NovelDetailScreen(novelId: item.novelId),
            ),
          );
          if (!mounted) return;
          bookmarkBloc.add(FetchBookmarksEvent());
        },
        borderRadius: AppRadius.roundedMd,
        child: Container(
          padding: AppSpacing.paddingSm,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppRadius.roundedMd,
            border: Border.all(color: AppColors.divider, width: 0.8),
            boxShadow: AppElevation.shadowCard,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cover Thumbnail
              ClipRRect(
                borderRadius: AppRadius.roundedSm,
                child: SizedBox(
                  width: AppSpacing.xl3 + AppSpacing.lg, // 72.0
                  height: AppSpacing.xl4 + AppSpacing.xl2, // 104.0
                  child: item.coverImageUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: item.coverImageUrl,
                          fit: BoxFit.cover,
                          placeholder: (_, _) => Container(
                            color: AppColors.background.withValues(alpha: 0.5),
                            child: const Center(
                              child: SizedBox(
                                width: AppIconSize.sm,
                                height: AppIconSize.sm,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppColors.primary,
                                ),
                              ),
                            ),
                          ),
                          errorWidget: (_, _, _) => Container(
                            color: AppColors.background,
                            child: const Center(
                              child: Icon(
                                Icons.auto_stories_outlined,
                                color: AppColors.disabled,
                                size: AppIconSize.lg,
                              ),
                            ),
                          ),
                        )
                      : Container(
                          color: AppColors.background,
                          child: const Center(
                            child: Icon(
                              Icons.auto_stories_outlined,
                              color: AppColors.disabled,
                              size: AppIconSize.lg,
                            ),
                          ),
                        ),
                ),
              ),

              const SizedBox(width: AppSpacing.md),

              // Metadata & Reading Progress
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(
                      item.novelTitle,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.h3.copyWith(
                        fontSize: 15.0,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),

                    // Author
                    Row(
                      children: [
                        const Icon(
                          Icons.person_outline_rounded,
                          size: AppIconSize.xs,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Expanded(
                          child: Text(
                            item.authorName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.caption,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),

                    // Last read chapter indicator
                    Row(
                      children: [
                        const Icon(
                          Icons.bookmark_added_rounded,
                          size: AppIconSize.xs,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Expanded(
                          child: Text(
                            item.lastChapterNumber != null
                                ? 'Đang đọc: Chương ${item.lastChapterNumber}'
                                : 'Chưa bắt đầu đọc',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.bodyS.copyWith(
                              fontSize: 12.0,
                              color: item.lastChapterNumber != null
                                  ? AppColors.primary
                                  : AppColors.textMuted,
                              fontWeight: item.lastChapterNumber != null
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xs),

                    // Reading progress bar
                    Row(
                      children: [
                        Expanded(
                          child: ClipRRect(
                            borderRadius: AppRadius.roundedSm,
                            child: LinearProgressIndicator(
                              value: progress,
                              minHeight: AppSpacing.xs,
                              backgroundColor: AppColors.divider,
                              valueColor: const AlwaysStoppedAnimation<Color>(
                                AppColors.primary,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Text(
                          '${item.readingProgressPercent}%',
                          style: AppTypography.overline.copyWith(
                            fontSize: 10.5,
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(width: AppSpacing.xs),

              // Actions Column (Continue & Remove)
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Play / Continue Reading button
                  if (item.lastChapterId != null)
                    IconButton(
                      icon: const Icon(Icons.play_circle_filled_rounded),
                      iconSize: AppIconSize.lg,
                      color: AppColors.primary,
                      tooltip: 'Đọc tiếp',
                      padding: AppSpacing.paddingXs,
                      constraints: const BoxConstraints(),
                      onPressed: () async {
                        final bookmarkBloc = context.read<BookmarkBloc>();
                        await Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => ReaderScreen(
                              novelId: item.novelId,
                              chapterId: item.lastChapterId!,
                              novelTitle: item.novelTitle,
                            ),
                          ),
                        );
                        if (!mounted) return;
                        bookmarkBloc.add(FetchBookmarksEvent());
                      },
                    )
                  else
                    IconButton(
                      icon: const Icon(Icons.arrow_forward_ios_rounded),
                      iconSize: AppIconSize.xs,
                      color: AppColors.textSecondary,
                      padding: AppSpacing.paddingXs,
                      constraints: const BoxConstraints(),
                      onPressed: () async {
                        final bookmarkBloc = context.read<BookmarkBloc>();
                        await Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => NovelDetailScreen(novelId: item.novelId),
                          ),
                        );
                        if (!mounted) return;
                        bookmarkBloc.add(FetchBookmarksEvent());
                      },
                    ),

                  const SizedBox(height: AppSpacing.sm),

                  // Subtle Remove Bookmark Button
                  IconButton(
                    icon: const Icon(Icons.bookmark_remove_outlined),
                    iconSize: AppIconSize.sm,
                    color: AppColors.textMuted,
                    tooltip: 'Bỏ lưu',
                    padding: AppSpacing.paddingXs,
                    constraints: const BoxConstraints(),
                    onPressed: () => _showRemoveConfirmDialog(context, item),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUnauthenticatedState(BuildContext context) {
    return Center(
      child: Padding(
        padding: AppSpacing.paddingLg,
        child: Container(
          padding: AppSpacing.paddingLg,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppRadius.roundedXl,
            boxShadow: AppElevation.shadowCard,
            border: Border.all(color: AppColors.divider, width: 0.8),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: AppSpacing.paddingLg,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.10),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.auto_stories_outlined,
                  size: AppIconSize.xl,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                'Đăng nhập để xem tủ sách',
                textAlign: TextAlign.center,
                style: AppTypography.h2,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Tủ sách giúp đồng bộ hành trình đọc, ghi nhớ chương đang dang dở và lưu giữ các tác phẩm tâm đắc của bạn.',
                textAlign: TextAlign.center,
                style: AppTypography.bodyM.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: AppSpacing.lg),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                },
                icon: const Icon(Icons.login_rounded, size: AppIconSize.sm),
                label: const Text('Đăng nhập ngay'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: AppSpacing.paddingLg,
        child: Container(
          padding: AppSpacing.paddingLg,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppRadius.roundedXl,
            boxShadow: AppElevation.shadowCard,
            border: Border.all(color: AppColors.divider, width: 0.8),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: AppSpacing.paddingLg,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.bookmark_border_rounded,
                  size: AppIconSize.xl,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                'Tủ sách hiện đang trống',
                textAlign: TextAlign.center,
                style: AppTypography.h2,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Bạn chưa lưu tác phẩm nào. Hãy nhấn biểu tượng Yêu thích khi xem truyện để đánh dấu vào tủ sách nhé!',
                textAlign: TextAlign.center,
                style: AppTypography.bodyM.copyWith(color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(
            width: AppIconSize.xl,
            height: AppIconSize.xl,
            child: CircularProgressIndicator(
              strokeWidth: 3.0,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Đang mở tủ sách...',
            style: AppTypography.bodyM.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, String message) {
    return Center(
      child: Padding(
        padding: AppSpacing.paddingLg,
        child: Container(
          padding: AppSpacing.paddingLg,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppRadius.roundedLg,
            boxShadow: AppElevation.shadowCard,
            border: Border.all(color: AppColors.error, width: 0.8),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.error_outline_rounded,
                color: AppColors.error,
                size: AppIconSize.xl,
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                'Không thể tải tủ sách',
                style: AppTypography.h3,
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                message,
                textAlign: TextAlign.center,
                style: AppTypography.caption.copyWith(color: AppColors.error),
              ),
              const SizedBox(height: AppSpacing.md),
              ElevatedButton(
                onPressed: () {
                  context.read<BookmarkBloc>().add(FetchBookmarksEvent());
                },
                child: const Text('Thử lại'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
