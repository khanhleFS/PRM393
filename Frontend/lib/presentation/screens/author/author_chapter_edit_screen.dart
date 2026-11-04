import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_tokens.dart';
import '../../../data/models/chapter_model.dart';
import '../../../data/repositories/author_repository.dart';
import '../../../data/repositories/chapter_repository.dart';

class AuthorChapterEditScreen extends StatefulWidget {
  final dynamic novelId;
  final ChapterModel? chapter;
  final int? suggestedChapterNumber;

  const AuthorChapterEditScreen({
    super.key,
    required this.novelId,
    this.chapter,
    this.suggestedChapterNumber,
  });

  @override
  State<AuthorChapterEditScreen> createState() =>
      _AuthorChapterEditScreenState();
}

class _AuthorChapterEditScreenState extends State<AuthorChapterEditScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _numberController;
  late final TextEditingController _titleController;
  late final TextEditingController _coinPriceController;
  late final TextEditingController _contentController;

  String _status = 'UNLOCKED';
  bool _isLoadingContent = false;
  bool _isSaving = false;

  bool get _isEditing => widget.chapter != null;

  @override
  void initState() {
    super.initState();
    final initialNumber = widget.chapter?.chapterNumber ??
        widget.suggestedChapterNumber ??
        1;
    _numberController = TextEditingController(text: '$initialNumber');
    _titleController = TextEditingController(
      text: widget.chapter?.title ?? 'Chương $initialNumber: ',
    );
    _coinPriceController = TextEditingController(
      text: '${widget.chapter?.coinPrice ?? 0}',
    );
    _contentController = TextEditingController(
      text: widget.chapter?.content ?? '',
    );
    _status = widget.chapter?.status.toUpperCase() == 'LOCKED'
        ? 'LOCKED'
        : 'UNLOCKED';

    if (_isEditing &&
        (widget.chapter!.content == null ||
            widget.chapter!.content!.trim().isEmpty)) {
      _loadExistingContent();
    }
  }

  @override
  void dispose() {
    _numberController.dispose();
    _titleController.dispose();
    _coinPriceController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _loadExistingContent() async {
    setState(() => _isLoadingContent = true);
    try {
      final chapterRepo = context.read<ChapterRepository>();
      final fullChapter = await chapterRepo.readChapter(
        widget.novelId,
        widget.chapter!.id,
      );
      if (mounted && fullChapter.content != null) {
        setState(() {
          _contentController.text = fullChapter.content!;
          _isLoadingContent = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoadingContent = false);
      }
    }
  }

  int get _wordCount {
    final text = _contentController.text.trim();
    if (text.isEmpty) return 0;
    return text.split(RegExp(r'\s+')).length;
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    final number = int.tryParse(_numberController.text.trim()) ?? 1;
    final coinPrice = int.tryParse(_coinPriceController.text.trim()) ?? 0;
    final title = _titleController.text.trim();
    final content = _contentController.text.trim();

    if (title.contains('<') || title.contains('>')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tiêu đề không được chứa ký tự đặc biệt < hoặc >'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    if (content.contains('<') || content.contains('>')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Nội dung không được chứa ký tự đặc biệt < hoặc >'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);
    final repo = context.read<AuthorRepository>();

    try {
      if (_isEditing) {
        await repo.updateChapter(
          novelId: widget.novelId,
          chapterId: widget.chapter!.id,
          title: title,
          content: content,
          chapterNumber: number,
          coinPrice: coinPrice,
          status: _status,
        );
      } else {
        await repo.createChapter(
          novelId: widget.novelId,
          title: title,
          content: content,
          chapterNumber: number,
          coinPrice: coinPrice,
          status: _status,
        );
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _isEditing
                  ? 'Đã cập nhật chương thành công!'
                  : 'Đã xuất bản chương mới thành công!',
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
              'Lưu chương thất bại: ${e.toString().replaceAll('Exception: ', '')}',
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
        title: Text(_isEditing ? 'Sửa chương truyện' : 'Soạn chương mới'),
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
                    _isEditing ? 'Lưu cập nhật' : 'Xuất bản chương',
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
              // Hàng: Số chương & Giá xu
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 1,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Số chương *', style: AppTypography.h3),
                        const SizedBox(height: AppSpacing.xs),
                        TextFormField(
                          controller: _numberController,
                          keyboardType: TextInputType.number,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                          ],
                          decoration: const InputDecoration(
                            hintText: '1, 2, 3...',
                            prefixIcon: Icon(Icons.tag),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Cần nhập số';
                            }
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    flex: 1,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Giá xu (0 = Free)', style: AppTypography.h3),
                        const SizedBox(height: AppSpacing.xs),
                        TextFormField(
                          controller: _coinPriceController,
                          keyboardType: TextInputType.number,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                          ],
                          decoration: const InputDecoration(
                            hintText: '0 xu',
                            prefixIcon: Icon(Icons.monetization_on_outlined),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Nhập giá xu';
                            }
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xs),
              // Preset giá xu nhanh
              Row(
                children: [
                  Text('Chọn nhanh: ', style: AppTypography.caption),
                  _buildCoinChip(0, 'Free'),
                  const SizedBox(width: 4),
                  _buildCoinChip(5, '5 xu'),
                  const SizedBox(width: 4),
                  _buildCoinChip(10, '10 xu'),
                  const SizedBox(width: 4),
                  _buildCoinChip(20, '20 xu'),
                ],
              ),
              const SizedBox(height: AppSpacing.md),

              // Tiêu đề chương
              Text('Tiêu đề chương *', style: AppTypography.h3),
              const SizedBox(height: AppSpacing.xs),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  hintText: 'Ví dụ: Chương 1: Mở đầu cuộc hành trình...',
                  prefixIcon: Icon(Icons.title),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Vui lòng nhập tiêu đề chương';
                  }
                  return null;
                },
              ),
              const SizedBox(height: AppSpacing.md),

              // Trạng thái chương
              Text('Trạng thái mở khóa', style: AppTypography.h3),
              const SizedBox(height: AppSpacing.xs),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(
                    value: 'UNLOCKED',
                    label: Text('Công khai'),
                    icon: Icon(Icons.lock_open),
                  ),
                  ButtonSegment(
                    value: 'LOCKED',
                    label: Text('Tạm khóa'),
                    icon: Icon(Icons.lock_outline),
                  ),
                ],
                selected: {_status},
                onSelectionChanged: (val) {
                  setState(() => _status = val.first);
                },
              ),
              const SizedBox(height: AppSpacing.lg),

              // Soạn nội dung chương
              Row(
                children: [
                  Text('Nội dung chương *', style: AppTypography.h3),
                  const Spacer(),
                  if (_isLoadingContent)
                    const Text(
                      'Đang tải nội dung...',
                      style: TextStyle(fontSize: 12, color: AppColors.primary),
                    )
                  else
                    Text(
                      '$_wordCount từ • ${_contentController.text.length} ký tự',
                      style: AppTypography.caption,
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.xs),
              TextFormField(
                controller: _contentController,
                maxLines: 18,
                minLines: 10,
                onChanged: (_) => setState(() {}),
                style: const TextStyle(
                  fontSize: 15,
                  height: 1.6,
                  color: AppColors.textDark,
                ),
                decoration: InputDecoration(
                  hintText:
                      'Bắt đầu gõ nội dung câu chuyện tại đây...\n\nĐoạn văn được phân cách bằng các lần xuống dòng.',
                  alignLabelWithHint: true,
                  filled: true,
                  fillColor: AppColors.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: const BorderSide(
                      color: AppColors.divider,
                      width: 0.8,
                    ),
                  ),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Vui lòng nhập nội dung chương truyện';
                  }
                  return null;
                },
              ),
              const SizedBox(height: AppSpacing.xl2),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCoinChip(int coins, String label) {
    return InkWell(
      onTap: () {
        setState(() {
          _coinPriceController.text = '$coins';
        });
      },
      borderRadius: BorderRadius.circular(AppRadius.full),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.full),
          border: Border.all(color: AppColors.divider, width: 0.8),
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
      ),
    );
  }
}
