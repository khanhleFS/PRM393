import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_tokens.dart';
import '../../../data/models/novel_model.dart';
import '../../../data/repositories/author_repository.dart';
import '../../widgets/app_network_image.dart';
import '../auth/login_screen.dart';
import 'author_chapters_screen.dart';
import 'author_novel_edit_screen.dart';

class AuthorNovelsScreen extends StatefulWidget {
  const AuthorNovelsScreen({super.key});

  @override
  State<AuthorNovelsScreen> createState() => _AuthorNovelsScreenState();
}

class _AuthorNovelsScreenState extends State<AuthorNovelsScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<NovelModel> _novels = [];

  @override
  void initState() {
    super.initState();
    _loadNovels();
  }

  Future<void> _loadNovels() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final repo = context.read<AuthorRepository>();
      final list = await repo.getMyNovels();
      if (mounted) {
        setState(() {
          _novels = list;
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

  Future<void> _confirmDelete(NovelModel novel) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        title: Text(
          'Xóa tác phẩm?',
          style: AppTypography.h3.copyWith(color: AppColors.error),
        ),
        content: Text(
          'Bạn có chắc chắn muốn xóa bộ truyện "${novel.title}"? Hành động này sẽ xóa toàn bộ các chương liên quan và không thể hoàn tác.',
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
        await context.read<AuthorRepository>().deleteNovel(novel.id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Đã xóa thành công bộ truyện "${novel.title}"'),
              backgroundColor: AppColors.success,
            ),
          );
          _loadNovels();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Lỗi khi xóa truyện: ${e.toString().replaceAll('Exception: ', '')}'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Studio Tác giả'),
        backgroundColor: AppColors.background,
        elevation: AppElevation.none,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Làm mới',
            onPressed: _loadNovels,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.surface,
        icon: const Icon(Icons.add),
        label: const Text('Tạo truyện mới'),
        onPressed: () async {
          final res = await Navigator.of(context).push<bool>(
            MaterialPageRoute(
              builder: (_) => const AuthorNovelEditScreen(),
            ),
          );
          if (res == true) {
            _loadNovels();
          }
        },
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, authState) {
          if (authState is! Authenticated) {
            return Center(
              child: Padding(
                padding: AppSpacing.paddingLg,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.lock_outline_rounded,
                      size: AppIconSize.xl,
                      color: AppColors.disabled,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      'Vui lòng đăng nhập tài khoản tác giả để quản lý tác phẩm',
                      textAlign: TextAlign.center,
                      style: AppTypography.bodyM.copyWith(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                      },
                      child: const Text('Đăng nhập ngay'),
                    ),
                  ],
                ),
              ),
            );
          }

          final user = authState.user;
          final isAuthor = user.isAuthor || user.role.toUpperCase() == 'AUTHOR' || user.role.toUpperCase() == 'ADMIN';

          return RefreshIndicator(
            color: AppColors.primary,
            backgroundColor: AppColors.surface,
            onRefresh: _loadNovels,
            child: ListView(
              padding: AppSpacing.paddingMd,
              children: [
                if (!isAuthor)
                  Container(
                    margin: const EdgeInsets.only(bottom: AppSpacing.md),
                    padding: AppSpacing.paddingMd,
                    decoration: BoxDecoration(
                      color: AppColors.warning.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: AppColors.warning, width: 0.8),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.info_outline, color: AppColors.warning),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Lưu ý quyền Tác giả',
                                style: AppTypography.h3.copyWith(fontSize: 14),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Tài khoản của bạn hiện là "${user.role}". Để xuất bản hoặc sửa truyện trên server, bạn có thể đăng nhập tài khoản tác giả demo: author@sba.com / Password123',
                                style: AppTypography.caption.copyWith(color: AppColors.textDark),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

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
                          onPressed: _loadNovels,
                          child: const Text('Thử lại'),
                        ),
                      ],
                    ),
                  )
                else if (_novels.isEmpty)
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
                          Icons.auto_stories_outlined,
                          size: AppIconSize.xl,
                          color: AppColors.disabled,
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          'Bạn chưa có bộ truyện nào',
                          style: AppTypography.h3,
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          'Hãy bắt đầu sáng tác và xuất bản tác phẩm đầu tay của bạn ngay hôm nay!',
                          textAlign: TextAlign.center,
                          style: AppTypography.bodyM.copyWith(color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        ElevatedButton.icon(
                          onPressed: () async {
                            final res = await Navigator.of(context).push<bool>(
                              MaterialPageRoute(
                                builder: (_) => const AuthorNovelEditScreen(),
                              ),
                            );
                            if (res == true) _loadNovels();
                          },
                          icon: const Icon(Icons.add),
                          label: const Text('Sáng tác truyện đầu tay'),
                        ),
                      ],
                    ),
                  )
                else
                  ..._novels.map((novel) => _buildNovelCard(novel)),
                const SizedBox(height: 80),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildNovelCard(NovelModel novel) {
    final isOngoing = novel.status.toUpperCase() == 'ONGOING';

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: AppSpacing.paddingMd,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider, width: 0.8),
        boxShadow: AppElevation.shadowCard,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(AppRadius.sm),
                child: SizedBox(
                  width: 72,
                  height: 104,
                  child: AppNetworkImage(
                    imageUrl: novel.coverImageUrl,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      novel.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.h3.copyWith(fontSize: 16),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: isOngoing
                                ? AppColors.success.withValues(alpha: 0.12)
                                : AppColors.primary.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            isOngoing ? 'Đang ra' : 'Hoàn thành',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isOngoing
                                  ? AppColors.success
                                  : AppColors.primary,
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Text(
                          '${novel.viewCount} lượt xem',
                          style: AppTypography.caption,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    if (novel.description.isNotEmpty)
                      Text(
                        novel.description,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.bodyS.copyWith(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          const Divider(height: 1, color: AppColors.divider),
          const SizedBox(height: AppSpacing.xs),
          Row(
            children: [
              // Nút Quản lý chương
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: AppColors.surface,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    elevation: AppElevation.none,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                  ),
                  icon: const Icon(Icons.format_list_bulleted_rounded, size: 16),
                  label: const Text('Quản lý chương', style: TextStyle(fontSize: 12)),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => AuthorChaptersScreen(novel: novel),
                      ),
                    ).then((_) => _loadNovels());
                  },
                ),
              ),
              const SizedBox(width: AppSpacing.xs),
              // Nút Sửa
              IconButton(
                icon: const Icon(Icons.edit_outlined, size: 20),
                tooltip: 'Sửa thông tin truyện',
                color: AppColors.textDark,
                onPressed: () async {
                  final res = await Navigator.of(context).push<bool>(
                    MaterialPageRoute(
                      builder: (_) => AuthorNovelEditScreen(novel: novel),
                    ),
                  );
                  if (res == true) {
                    _loadNovels();
                  }
                },
              ),
              // Nút Xóa
              IconButton(
                icon: const Icon(Icons.delete_outline_rounded, size: 20),
                tooltip: 'Xóa truyện',
                color: AppColors.error,
                onPressed: () => _confirmDelete(novel),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
