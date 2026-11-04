import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_tokens.dart';
import '../../../data/models/chapter_model.dart';
import '../../../data/models/novel_model.dart';
import '../../../data/repositories/author_repository.dart';
import '../reader/reader_screen.dart';
import 'author_chapter_edit_screen.dart';

class AuthorChaptersScreen extends StatefulWidget {
  final NovelModel novel;

  const AuthorChaptersScreen({super.key, required this.novel});

  @override
  State<AuthorChaptersScreen> createState() => _AuthorChaptersScreenState();
}

class _AuthorChaptersScreenState extends State<AuthorChaptersScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<ChapterModel> _chapters = [];

  @override
  void initState() {
    super.initState();
    _loadChapters();
  }

  Future<void> _loadChapters() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final repo = context.read<AuthorRepository>();
      final list = await repo.getNovelChapters(widget.novel.id);
      if (mounted) {
        // Sort chapters by chapterNumber
        list.sort((a, b) => a.chapterNumber.compareTo(b.chapterNumber));
        setState(() {
          _chapters = list;
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

  Future<void> _confirmDeleteChapter(ChapterModel chapter) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        title: Text(
          'Xóa chương truyện?',
          style: AppTypography.h3.copyWith(color: AppColors.error),
        ),
        content: Text(
          'Bạn có chắc chắn muốn xóa "${chapter.title}"? Dữ liệu chương sẽ bị xóa vĩnh viễn.',
          style: AppTypography.bodyM,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(
              'Hủy',
              style: AppTypography.button.copyWith(color: AppColors.textSecondary),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: AppColors.surface,
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Xác nhận xóa'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      try {
        await context.read<AuthorRepository>().deleteChapter(
              novelId: widget.novel.id,
              chapterId: chapter.id,
            );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Đã xóa chương "${chapter.title}"'),
              backgroundColor: AppColors.success,
            ),
          );
          _loadChapters();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Lỗi khi xóa chương: ${e.toString().replaceAll('Exception: ', '')}'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    }
  }

  int get _nextChapterNumber {
    if (_chapters.isEmpty) return 1;
    return _chapters.map((e) => e.chapterNumber).reduce((a, b) => a > b ? a : b) + 1;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(widget.novel.title),
        backgroundColor: AppColors.background,
        elevation: AppElevation.none,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Làm mới',
            onPressed: _loadChapters,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.surface,
        icon: const Icon(Icons.edit_note_rounded),
        label: const Text('Viết chương mới'),
        onPressed: () async {
          final res = await Navigator.of(context).push<bool>(
            MaterialPageRoute(
              builder: (_) => AuthorChapterEditScreen(
                novelId: widget.novel.id,
                suggestedChapterNumber: _nextChapterNumber,
              ),
            ),
          );
          if (res == true) {
            _loadChapters();
          }
        },
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        backgroundColor: AppColors.surface,
        onRefresh: _loadChapters,
        child: ListView(
          padding: AppSpacing.paddingMd,
          children: [
            // Header Card
            Container(
              padding: AppSpacing.paddingMd,
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: AppColors.divider, width: 0.8),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.auto_stories,
                    color: AppColors.primary,
                    size: 28,
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Mục lục tác phẩm', style: AppTypography.h3),
                        const SizedBox(height: 2),
                        Text(
                          'Tổng cộng ${_chapters.length} chương đã phát hành',
                          style: AppTypography.caption,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),

            if (_isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: AppSpacing.xl2),
                child: Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              )
            else if (_errorMessage != null)
              Container(
                padding: AppSpacing.paddingLg,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.divider, width: 0.8),
                ),
                child: Column(
                  children: [
                    const Icon(
                      Icons.error_outline_rounded,
                      size: AppIconSize.lg,
                      color: AppColors.error,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      _errorMessage!,
                      textAlign: TextAlign.center,
                      style: AppTypography.bodyM.copyWith(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    ElevatedButton(
                      onPressed: _loadChapters,
                      child: const Text('Thử lại'),
                    ),
                  ],
                ),
              )
            else if (_chapters.isEmpty)
              Container(
                padding: AppSpacing.paddingLg,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.divider, width: 0.8),
                ),
                child: Column(
                  children: [
                    const Icon(
                      Icons.note_alt_outlined,
                      size: AppIconSize.xl,
                      color: AppColors.disabled,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      'Tác phẩm chưa có chương nào',
                      style: AppTypography.h3,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      'Hãy viết chương đầu tiên để độc giả có thể thưởng thức tác phẩm của bạn!',
                      textAlign: TextAlign.center,
                      style: AppTypography.bodyM.copyWith(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    ElevatedButton.icon(
                      onPressed: () async {
                        final res = await Navigator.of(context).push<bool>(
                          MaterialPageRoute(
                            builder: (_) => AuthorChapterEditScreen(
                              novelId: widget.novel.id,
                              suggestedChapterNumber: 1,
                            ),
                          ),
                        );
                        if (res == true) _loadChapters();
                      },
                      icon: const Icon(Icons.add),
                      label: const Text('Viết Chương 1 ngay'),
                    ),
                  ],
                ),
              )
            else
              ..._chapters.map((chapter) => _buildChapterTile(chapter)),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildChapterTile(ChapterModel chapter) {
    final isVip = chapter.coinPrice > 0;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider, width: 0.8),
        boxShadow: AppElevation.shadowCard,
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: 4,
        ),
        leading: CircleAvatar(
          backgroundColor: AppColors.primary.withValues(alpha: 0.12),
          child: Text(
            '${chapter.chapterNumber}',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
              fontSize: 13,
            ),
          ),
        ),
        title: Text(
          chapter.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: AppTypography.bodyM.copyWith(fontWeight: FontWeight.w600),
        ),
        subtitle: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: isVip
                    ? AppColors.coinGold.withValues(alpha: 0.15)
                    : AppColors.success.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                isVip ? '${chapter.coinPrice} xu (VIP)' : 'Miễn phí',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: isVip ? AppColors.coinGold : AppColors.success,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Text(
              '${chapter.viewCount} lượt đọc',
              style: AppTypography.caption,
            ),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Preview / Read
            IconButton(
              icon: const Icon(Icons.visibility_outlined, size: 20),
              tooltip: 'Đọc thử chương này',
              color: AppColors.primary,
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => ReaderScreen(
                      novelId: widget.novel.id,
                      chapterId: chapter.id,
                      novelTitle: widget.novel.title,
                      chaptersList: _chapters,
                    ),
                  ),
                );
              },
            ),
            // Edit
            IconButton(
              icon: const Icon(Icons.edit_outlined, size: 20),
              tooltip: 'Sửa chương',
              color: AppColors.textDark,
              onPressed: () async {
                final res = await Navigator.of(context).push<bool>(
                  MaterialPageRoute(
                    builder: (_) => AuthorChapterEditScreen(
                      novelId: widget.novel.id,
                      chapter: chapter,
                    ),
                  ),
                );
                if (res == true) {
                  _loadChapters();
                }
              },
            ),
            // Delete
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded, size: 20),
              tooltip: 'Xóa chương',
              color: AppColors.error,
              onPressed: () => _confirmDeleteChapter(chapter),
            ),
          ],
        ),
      ),
    );
  }
}
