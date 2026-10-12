import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/bookmark/bookmark_bloc.dart';
import '../../../bloc/bookmark/bookmark_event.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/chapter_model.dart';
import '../../../data/models/novel_model.dart';
import '../../../data/repositories/bookmark_repository.dart';
import '../../../data/repositories/chapter_repository.dart';
import '../../../data/repositories/novel_repository.dart';
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
          ToggleBookmarkEvent(
            novelId: widget.novelId,
            isFavorite: _isFavorite,
          ),
        );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _isFavorite
              ? 'Đã thêm truyện vào Tủ sách của bạn'
              : 'Đã xóa truyện khỏi Tủ sách',
        ),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  void _openChapter(ChapterModel chapter) {
    if (_novel == null) return;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ReaderScreen(
          novelId: widget.novelId,
          chapterId: chapter.id,
          novelTitle: _novel!.title,
          chaptersList: _chapters,
        ),
      ),
    ).then((_) {
      // Reload on pop to refresh read counts or unlocks
      _loadData();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    if (_errorMessage != null || _novel == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(_errorMessage ?? 'Lỗi không xác định'),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: _loadData,
                child: const Text('Thử lại'),
              ),
            ],
          ),
        ),
      );
    }

    final novel = _novel!;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar with cover image
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            actions: [
              IconButton(
                icon: Icon(
                  _isFavorite ? Icons.favorite : Icons.favorite_border,
                  color: _isFavorite ? Colors.red : Colors.white,
                ),
                onPressed: _toggleBookmark,
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  novel.coverImageUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: novel.coverImageUrl,
                          fit: BoxFit.cover,
                          errorWidget: (_, _, _) => Container(color: AppColors.primary),
                        )
                      : Container(color: AppColors.primary),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.3),
                          Colors.black.withValues(alpha: 0.85),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 20,
                    left: 20,
                    right: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          novel.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Tác giả: ${novel.authorName}',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Content body
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Meta stats row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatColumn('${novel.chapterCount}', 'Chương'),
                      _buildStatColumn('${novel.viewCount}', 'Lượt đọc'),
                      _buildStatColumn(
                        novel.status == 'ONGOING' ? 'Đang ra' : 'Hoàn thành',
                        'Trạng thái',
                      ),
                    ],
                  ),
                  const Divider(height: 32),

                  // Categories tags
                  if (novel.categories.isNotEmpty) ...[
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: novel.categories
                          .map(
                            (c) => Chip(
                              label: Text(c, style: const TextStyle(fontSize: 12)),
                              backgroundColor: AppColors.primary.withValues(alpha: 0.08),
                              side: BorderSide.none,
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Description
                  const Text(
                    'Giới thiệu tác phẩm',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    novel.description.isNotEmpty
                        ? novel.description
                        : 'Chưa có thông tin giới thiệu.',
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      height: 1.5,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.menu_book),
                          label: const Text('Đọc từ đầu'),
                          onPressed: _chapters.isNotEmpty
                              ? () => _openChapter(_chapters.first)
                              : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          side: BorderSide(
                            color: _isFavorite ? Colors.red : Colors.grey.shade400,
                          ),
                        ),
                        icon: Icon(
                          _isFavorite ? Icons.favorite : Icons.favorite_border,
                          color: _isFavorite ? Colors.red : AppColors.textSecondary,
                        ),
                        label: Text(
                          _isFavorite ? 'Đã lưu' : 'Tủ sách',
                          style: TextStyle(
                            color: _isFavorite ? Colors.red : AppColors.textPrimary,
                          ),
                        ),
                        onPressed: _toggleBookmark,
                      ),
                    ],
                  ),
                  const Divider(height: 40),

                  // Chapters Section Header
                  Row(
                    children: [
                      Text(
                        'Danh sách chương (${_chapters.length})',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),

          // Chapter List
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final chapter = _chapters[index];
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  title: Text(
                    chapter.title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    'Chương ${chapter.chapterNumber} • ${chapter.viewCount} lượt xem',
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                  trailing: chapter.isLocked
                      ? Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.amber.shade50,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.amber.shade400),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.lock, size: 14, color: Colors.amber),
                              const SizedBox(width: 4),
                              Text(
                                '${chapter.coinPrice} xu',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.amber.shade900,
                                ),
                              ),
                            ],
                          ),
                        )
                      : Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'Miễn phí',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.green,
                            ),
                          ),
                        ),
                  onTap: () => _openChapter(chapter),
                );
              },
              childCount: _chapters.length,
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 32)),
        ],
      ),
    );
  }

  Widget _buildStatColumn(String val, String label) {
    return Column(
      children: [
        Text(
          val,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
