import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_tokens.dart';
import '../../../data/models/novel_model.dart';
import '../../../data/repositories/author_repository.dart';
import '../../widgets/app_network_image.dart';

class AuthorNovelEditScreen extends StatefulWidget {
  final NovelModel? novel;

  const AuthorNovelEditScreen({super.key, this.novel});

  @override
  State<AuthorNovelEditScreen> createState() => _AuthorNovelEditScreenState();
}

class _AuthorNovelEditScreenState extends State<AuthorNovelEditScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleController;
  late final TextEditingController _descriptionController;
  late final TextEditingController _coverController;

  String _status = 'ONGOING';
  final Set<String> _selectedCategoryIds = {};
  List<CategoryModel> _categories = [];
  bool _isLoadingCategories = true;
  bool _isSaving = false;

  bool get _isEditing => widget.novel != null;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.novel?.title ?? '');
    _descriptionController =
        TextEditingController(text: widget.novel?.description ?? '');
    _coverController =
        TextEditingController(text: widget.novel?.coverImageUrl ?? '');
    _status = widget.novel?.status.toUpperCase() == 'COMPLETED'
        ? 'COMPLETED'
        : 'ONGOING';

    _loadCategories();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _coverController.dispose();
    super.dispose();
  }

  Future<void> _loadCategories() async {
    try {
      final repo = context.read<AuthorRepository>();
      final list = await repo.getCategories();
      if (mounted) {
        setState(() {
          _categories = list;
          _isLoadingCategories = false;

          // If editing, pre-select matching categories by name
          if (_isEditing && widget.novel!.categories.isNotEmpty) {
            for (final cat in list) {
              if (widget.novel!.categories.contains(cat.name)) {
                _selectedCategoryIds.add(cat.id);
              }
            }
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoadingCategories = false);
      }
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    final repo = context.read<AuthorRepository>();

    try {
      if (_isEditing) {
        await repo.updateNovel(
          novelId: widget.novel!.id,
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          coverImageUrl: _coverController.text.trim(),
          status: _status,
          categoryIds: _selectedCategoryIds.toList(),
        );
      } else {
        await repo.createNovel(
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          coverImageUrl: _coverController.text.trim(),
          status: _status,
          categoryIds: _selectedCategoryIds.toList(),
        );
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _isEditing
                  ? 'Đã cập nhật tác phẩm thành công!'
                  : 'Đã tạo tác phẩm mới thành công!',
            ),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Lưu tác phẩm thất bại: ${e.toString().replaceAll('Exception: ', '')}',
            ),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(_isEditing ? 'Chỉnh sửa tác phẩm' : 'Sáng tác tác phẩm mới'),
        backgroundColor: AppColors.background,
        elevation: AppElevation.none,
      ),
      bottomNavigationBar: Container(
        padding: AppSpacing.paddingMd,
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(
            top: BorderSide(color: AppColors.divider, width: 0.8),
          ),
        ),
        child: SafeArea(
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.surface,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
            ),
            onPressed: _isSaving ? null : _save,
            child: _isSaving
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.surface,
                    ),
                  )
                : Text(
                    _isEditing ? 'Lưu thay đổi' : 'Xuất bản tác phẩm',
                    style: AppTypography.button,
                  ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: AppSpacing.paddingLg,
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Tiêu đề truyện
              Text('Tiêu đề truyện *', style: AppTypography.h3),
              const SizedBox(height: AppSpacing.xs),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  hintText: 'Nhập tên bộ truyện...',
                  prefixIcon: Icon(Icons.book_outlined),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Vui lòng nhập tiêu đề truyện';
                  }
                  return null;
                },
              ),
              const SizedBox(height: AppSpacing.lg),

              // Ảnh bìa
              Text('Đường dẫn ảnh bìa (URL)', style: AppTypography.h3),
              const SizedBox(height: AppSpacing.xs),
              TextFormField(
                controller: _coverController,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(
                  hintText: 'https://example.com/cover.jpg (để trống để dùng ảnh ngẫu nhiên)',
                  prefixIcon: Icon(Icons.image_outlined),
                ),
              ),
              if (_coverController.text.trim().isNotEmpty) ...[
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                      child: SizedBox(
                        width: 56,
                        height: 80,
                        child: AppNetworkImage(
                          imageUrl: _coverController.text.trim(),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      'Xem trước ảnh bìa',
                      style: AppTypography.caption,
                    ),
                  ],
                ),
              ],
              const SizedBox(height: AppSpacing.lg),

              // Trạng thái truyện
              Text('Trạng thái sáng tác', style: AppTypography.h3),
              const SizedBox(height: AppSpacing.xs),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(
                    value: 'ONGOING',
                    label: Text('Đang ra'),
                    icon: Icon(Icons.sync),
                  ),
                  ButtonSegment(
                    value: 'COMPLETED',
                    label: Text('Đã hoàn thành'),
                    icon: Icon(Icons.check_circle_outline),
                  ),
                ],
                selected: {_status},
                onSelectionChanged: (val) {
                  setState(() => _status = val.first);
                },
              ),
              const SizedBox(height: AppSpacing.lg),

              // Mô tả nội dung
              Text('Giới thiệu tóm tắt tác phẩm', style: AppTypography.h3),
              const SizedBox(height: AppSpacing.xs),
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Tóm tắt cốt truyện, thông điệp tác phẩm...',
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // Danh mục thể loại
              Text('Thể loại truyện', style: AppTypography.h3),
              const SizedBox(height: AppSpacing.xs),
              if (_isLoadingCategories)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(AppSpacing.md),
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                )
              else if (_categories.isEmpty)
                Text(
                  'Không có danh mục nào để chọn',
                  style: AppTypography.caption,
                )
              else
                Wrap(
                  spacing: AppSpacing.xs,
                  runSpacing: AppSpacing.xs,
                  children: _categories.map((cat) {
                    final selected = _selectedCategoryIds.contains(cat.id);
                    return FilterChip(
                      label: Text(cat.name),
                      selected: selected,
                      selectedColor: AppColors.primary.withValues(alpha: 0.18),
                      checkmarkColor: AppColors.primary,
                      onSelected: (bool isSelected) {
                        setState(() {
                          if (isSelected) {
                            _selectedCategoryIds.add(cat.id);
                          } else {
                            _selectedCategoryIds.remove(cat.id);
                          }
                        });
                      },
                    );
                  }).toList(),
                ),
              const SizedBox(height: AppSpacing.xl2),
            ],
          ),
        ),
      ),
    );
  }
}
