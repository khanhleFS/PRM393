import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_tokens.dart';
import '../../data/models/chapter_model.dart';

/// 3 Distinct Chapter States:
/// 1. Đang khóa: icon khóa (16px) + giá xu (chữ tối textPrimary, bo 8px)
/// 2. Miễn phí: "Miễn phí" (success, bo 8px)
/// 3. Chương trả phí đã mở: icon mở khóa (16px) + "Đã mở khóa" (info, bo 8px)
class ChapterBadge extends StatelessWidget {
  final ChapterModel chapter;

  const ChapterBadge({super.key, required this.chapter});

  @override
  Widget build(BuildContext context) {
    if (chapter.isLocked) {
      return Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: AppSpacing.xs,
        ),
        decoration: BoxDecoration(
          color: AppColors.warning.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.warning.withValues(alpha: 0.4)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.lock_rounded,
              size: AppIconSizes.sm,
              color: AppColors.warning,
            ),
            const SizedBox(width: AppSpacing.xs),
            Text(
              '${chapter.coinPrice} xu',
              style: AppTypography.caption.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      );
    } else if (chapter.isFree) {
      return Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: AppSpacing.xs,
        ),
        decoration: BoxDecoration(
          color: AppColors.success.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
        ),
        child: Text(
          'Miễn phí',
          style: AppTypography.caption.copyWith(
            color: AppColors.success,
            fontWeight: FontWeight.w700,
          ),
        ),
      );
    } else {
      // Chương trả phí đã mở
      return Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: AppSpacing.xs,
        ),
        decoration: BoxDecoration(
          color: AppColors.info.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.info.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.lock_open_rounded,
              size: AppIconSizes.sm,
              color: AppColors.info,
            ),
            const SizedBox(width: AppSpacing.xs),
            Text(
              'Đã mở khóa',
              style: AppTypography.caption.copyWith(
                color: AppColors.info,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      );
    }
  }
}
